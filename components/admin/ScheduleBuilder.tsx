"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import type { MA, Provider, ScheduleEntry } from "@/types"
import { getStaffingStatus, getStatusBorderClass } from "@/lib/staffing"

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Value encoding:
//   "off"        → MA not working (no DB row)
//   "unassigned" → MA working, no provider yet (DB row, provider_id = null)
//   <uuid>       → MA working with that provider (DB row, provider_id = uuid)
const OFF = "off"
const UNASSIGNED = "unassigned"

type Props = {
  mas: MA[]
  providers: Provider[]
  initialEntries: ScheduleEntry[]
  month: string // "YYYY-MM"
}

function getDaysInMonth(month: string) {
  const [year, m] = month.split("-").map(Number)
  const count = new Date(year, m, 0).getDate()
  return Array.from({ length: count }, (_, i) => {
    const day = i + 1
    const dateStr = `${month}-${String(day).padStart(2, "0")}`
    const d = new Date(year, m - 1, day)
    return { day, dateStr, dow: DOW[d.getDay()], isWeekend: d.getDay() === 0 || d.getDay() === 6 }
  })
}

function getMonthOptions(current: string) {
  const [year, m] = current.split("-").map(Number)
  const months = []
  for (let offset = -1; offset <= 4; offset++) {
    const d = new Date(year, m - 1 + offset, 1)
    const val = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    const label = d.toLocaleDateString("en-US", { month: "long", year: "numeric" })
    months.push({ val, label })
  }
  return months
}

function buildInitialAssignments(entries: ScheduleEntry[], mas: MA[], days: ReturnType<typeof getDaysInMonth>) {
  const map: Record<string, string> = {}
  // Default everything to "off"
  for (const day of days) {
    for (const ma of mas) {
      map[`${day.dateStr}_${ma.id}`] = OFF
    }
  }
  // Apply existing entries
  for (const entry of entries) {
    const key = `${entry.date}_${entry.ma_id}`
    map[key] = entry.provider_id ?? UNASSIGNED
  }
  return map
}

export function ScheduleBuilder({ mas, providers, initialEntries, month }: Props) {
  const router = useRouter()
  const days = getDaysInMonth(month)
  const monthOptions = getMonthOptions(month)

  const [assignments, setAssignments] = useState<Record<string, string>>(
    () => buildInitialAssignments(initialEntries, mas, days)
  )
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleChange = useCallback((dateStr: string, maId: string, value: string) => {
    setAssignments((prev) => ({ ...prev, [`${dateStr}_${maId}`]: value }))
    setIsDirty(true)
  }, [])

  async function handleSave() {
    setIsSaving(true)
    // Build entries: only non-off cells
    const entries: { date: string; ma_id: string; provider_id: string | null }[] = []
    for (const [key, value] of Object.entries(assignments)) {
      if (value === OFF) continue
      const [date, maId] = key.split("_")
      entries.push({
        date,
        ma_id: maId,
        provider_id: value === UNASSIGNED ? null : value,
      })
    }

    const res = await fetch("/api/schedule", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month, entries }),
    })

    setIsSaving(false)
    if (res.ok) {
      setIsDirty(false)
      toast.success("Schedule saved")
    } else {
      const json = await res.json()
      toast.error(json.error || "Failed to save schedule")
    }
  }

  function handleMonthChange(newMonth: string) {
    if (isDirty) {
      const confirmed = window.confirm("You have unsaved changes. Leave without saving?")
      if (!confirmed) return
    }
    router.push(`/admin?month=${newMonth}`)
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold text-[#1A1618]">Build Schedule</h1>
          <select
            value={month}
            onChange={(e) => handleMonthChange(e.target.value)}
            className="text-sm border border-[#CCCACB] rounded-lg px-3 py-1.5 bg-white text-[#1A1618] focus:outline-none focus:ring-2 focus:ring-[#066880]"
          >
            {monthOptions.map((opt) => (
              <option key={opt.val} value={opt.val}>{opt.label}</option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving || !isDirty}
          className="bg-[#066880] hover:bg-[#005A9A] text-white rounded-2xl disabled:opacity-50"
        >
          {isSaving ? "Saving…" : "Save Schedule"}
        </Button>
      </div>

      {/* Unsaved changes banner */}
      {isDirty && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          You have unsaved changes.
        </div>
      )}

      {/* Mobile warning */}
      <div className="rounded-lg border border-[#CCCACB] bg-[#FFFEF9] px-4 py-2 text-sm text-[#7A7A7A] md:hidden">
        Schedule builder works best on desktop.
      </div>

      {/* Grid */}
      <div className="overflow-x-auto rounded-2xl border border-[#CCCACB] shadow-sm">
        <table className="min-w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#066880] text-white">
              <th className="sticky left-0 z-10 bg-[#066880] px-3 py-3 text-left font-semibold whitespace-nowrap w-16">
                Date
              </th>
              <th className="px-3 py-3 text-left font-semibold w-12">Day</th>
              <th className="px-3 py-3 text-center font-semibold w-12">MAs</th>
              {mas.map((ma) => (
                <th key={ma.id} className="px-3 py-3 text-left font-semibold whitespace-nowrap min-w-[140px]">
                  {ma.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day, rowIdx) => {
              // Count staffed MAs, assigned MAs, and distinct providers for this day
              let staffedCount = 0
              let assignedCount = 0
              const providerSet = new Set<string>()
              for (const ma of mas) {
                const val = assignments[`${day.dateStr}_${ma.id}`]
                if (val !== OFF) {
                  staffedCount++
                  if (val !== UNASSIGNED) {
                    assignedCount++
                    providerSet.add(val)
                  }
                }
              }
              const provsCount = providerSet.size
              const status = getStaffingStatus(staffedCount, assignedCount, provsCount)
              const borderClass = getStatusBorderClass(status)
              const rowBg = rowIdx % 2 === 0 ? "bg-white" : "bg-[#FFFEF9]"

              return (
                <tr
                  key={day.dateStr}
                  className={`${rowBg} ${day.isWeekend ? "opacity-60" : ""}`}
                >
                  {/* Date cell */}
                  <td
                    className={`sticky left-0 z-10 ${rowBg} px-3 py-2 font-medium text-[#1A1618] whitespace-nowrap border-b border-[#CCCACB] border-l-2 ${borderClass}`}
                  >
                    {month.slice(5)}/{String(day.day).padStart(2, "0")}
                  </td>

                  {/* Day of week */}
                  <td className="px-3 py-2 text-[#4E545B] border-b border-[#CCCACB]">
                    {day.dow}
                  </td>

                  {/* MA count */}
                  <td className="px-3 py-2 text-center border-b border-[#CCCACB]">
                    <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${staffedCount > 0 ? "bg-[#61CE70]/20 text-green-800" : "bg-red-100 text-[#EF4444]"}`}>
                      {staffedCount}
                    </span>
                  </td>

                  {/* MA assignment cells */}
                  {mas.map((ma) => {
                    const key = `${day.dateStr}_${ma.id}`
                    const value = assignments[key] ?? OFF
                    return (
                      <td key={ma.id} className="px-2 py-1.5 border-b border-[#CCCACB]">
                        <select
                          value={value}
                          onChange={(e) => handleChange(day.dateStr, ma.id, e.target.value)}
                          className={`w-full text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[#066880] ${
                            value === OFF
                              ? "border-[#CCCACB] bg-[#F5F5F5] text-[#7A7A7A]"
                              : "border-[#066880] bg-[#066880]/5 text-[#066880] font-medium"
                          }`}
                        >
                          <option value={OFF}>Off</option>
                          <option value={UNASSIGNED}>— Unassigned —</option>
                          {providers.map((p) => (
                            <option key={p.id} value={p.id}>{p.name}</option>
                          ))}
                        </select>
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-[#7A7A7A]">
        Weekend rows are dimmed. Red left border = no MAs staffed for that day.
      </p>
    </div>
  )
}
