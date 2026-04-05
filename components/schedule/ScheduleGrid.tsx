"use client"

import { useRouter } from "next/navigation"
import type { MA, Provider, ScheduleEntry } from "@/types"
import {
  getStaffingStatus,
  getStatusBorderClass,
  getStatusLabel,
  getStatusDotColor,
  type StaffingStatus,
} from "@/lib/staffing"

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

type Props = {
  mas: MA[]
  providers: Provider[]
  entries: ScheduleEntry[]
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

function buildLookup(entries: ScheduleEntry[]) {
  // key: `${date}_${ma_id}` → provider_id | null | undefined
  const map: Record<string, string | null> = {}
  for (const entry of entries) {
    map[`${entry.date}_${entry.ma_id}`] = entry.provider_id
  }
  return map
}

export function ScheduleGrid({ mas, providers, entries, month }: Props) {
  const router = useRouter()
  const days = getDaysInMonth(month)
  const monthOptions = getMonthOptions(month)
  const lookup = buildLookup(entries)

  // Build provider name map for fast lookup
  const providerMap: Record<string, string> = {}
  for (const p of providers) {
    providerMap[p.id] = p.name
  }

  const [year, m] = month.split("-").map(Number)
  const currentMonthLabel = new Date(year, m - 1, 1).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  function navigateMonth(direction: "prev" | "next") {
    const [y, mo] = month.split("-").map(Number)
    const d = new Date(y, mo - 1 + (direction === "next" ? 1 : -1), 1)
    const newMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`
    router.push(`/schedule?month=${newMonth}`)
  }

  const hasAnyEntries = entries.length > 0

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold text-[#1A1618]">Schedule</h1>

        {/* Month navigation */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth("prev")}
            className="p-1.5 rounded-lg border border-[#CCCACB] hover:bg-[#F5F5F5] text-[#4E545B] transition-colors"
            aria-label="Previous month"
          >
            ←
          </button>
          <select
            value={month}
            onChange={(e) => router.push(`/schedule?month=${e.target.value}`)}
            className="text-sm border border-[#CCCACB] rounded-lg px-3 py-1.5 bg-white text-[#1A1618] focus:outline-none focus:ring-2 focus:ring-[#066880]"
          >
            {monthOptions.map((opt) => (
              <option key={opt.val} value={opt.val}>{opt.label}</option>
            ))}
          </select>
          <button
            onClick={() => navigateMonth("next")}
            className="p-1.5 rounded-lg border border-[#CCCACB] hover:bg-[#F5F5F5] text-[#4E545B] transition-colors"
            aria-label="Next month"
          >
            →
          </button>
        </div>
      </div>

      {/* Mobile warning */}
      <div className="rounded-lg border border-[#CCCACB] bg-[#FFFEF9] px-4 py-2 text-sm text-[#7A7A7A] md:hidden">
        Showing full schedule. Scroll horizontally to see all MAs.
      </div>

      {/* Empty state */}
      {!hasAnyEntries ? (
        <div className="rounded-2xl border border-[#CCCACB] bg-white shadow-sm flex flex-col items-center justify-center py-20 gap-3">
          <p className="text-lg font-semibold text-[#1A1618]">No schedule for {currentMonthLabel}</p>
          <p className="text-sm text-[#7A7A7A]">No schedule has been set for this month. Contact your manager.</p>
        </div>
      ) : (
        /* Grid */
        <div className="overflow-x-auto rounded-2xl border border-[#CCCACB] shadow-sm">
          <table className="min-w-full text-sm border-collapse">
            <thead>
              <tr className="bg-[#066880] text-white">
                <th className="sticky left-0 z-10 bg-[#066880] px-3 py-3 text-left font-semibold whitespace-nowrap w-16">
                  Date
                </th>
                <th className="px-3 py-3 text-left font-semibold w-12">Day</th>
                <th className="px-3 py-3 text-center font-semibold w-14">Provs</th>
                <th className="px-3 py-3 text-center font-semibold w-12">MAs</th>
                {mas.map((ma) => (
                  <th key={ma.id} className="px-3 py-3 text-left font-semibold whitespace-nowrap min-w-[130px]">
                    {ma.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day, rowIdx) => {
                const rowBg = rowIdx % 2 === 0 ? "bg-white" : "bg-[#FFFEF9]"

                // Count MAs working, assigned, and distinct providers for this day
                let staffedCount = 0
                let assignedCount = 0
                const providerSet = new Set<string>()
                for (const ma of mas) {
                  const val = lookup[`${day.dateStr}_${ma.id}`]
                  if (val !== undefined) {
                    staffedCount++
                    if (val !== null) {
                      assignedCount++
                      providerSet.add(val)
                    }
                  }
                }
                const provsCount = providerSet.size
                const status: StaffingStatus = getStaffingStatus(staffedCount, assignedCount, provsCount)
                const borderClass = getStatusBorderClass(status)

                return (
                  <tr
                    key={day.dateStr}
                    className={`${rowBg} ${day.isWeekend ? "opacity-60" : ""}`}
                  >
                    {/* Date */}
                    <td
                      className={`sticky left-0 z-10 ${rowBg} px-3 py-2 font-medium text-[#1A1618] whitespace-nowrap border-b border-[#CCCACB] border-l-2 ${borderClass}`}
                    >
                      {month.slice(5)}/{String(day.day).padStart(2, "0")}
                    </td>

                    {/* DOW */}
                    <td className="px-3 py-2 text-[#4E545B] border-b border-[#CCCACB]">
                      {day.dow}
                    </td>

                    {/* Provs count */}
                    <td className="px-3 py-2 text-center border-b border-[#CCCACB]">
                      <span className="text-xs font-semibold rounded-full px-2 py-0.5 bg-[#066880]/10 text-[#066880]">
                        {provsCount}
                      </span>
                    </td>

                    {/* MAs count */}
                    <td className="px-3 py-2 text-center border-b border-[#CCCACB]">
                      <span className={`text-xs font-semibold rounded-full px-2 py-0.5 ${staffedCount > 0 ? "bg-[#61CE70]/20 text-green-800" : "bg-red-100 text-[#EF4444]"}`}>
                        {staffedCount}
                      </span>
                    </td>

                    {/* Per-MA cells */}
                    {mas.map((ma) => {
                      const val = lookup[`${day.dateStr}_${ma.id}`]
                      // undefined = off (no entry), null = unassigned (entry, no provider)
                      const isOff = val === undefined
                      const isUnassigned = val === null
                      const providerName = !isOff && !isUnassigned ? providerMap[val!] : null

                      return (
                        <td key={ma.id} className="px-2 py-1.5 border-b border-[#CCCACB]">
                          {isOff ? (
                            <span className="text-xs text-[#CCCACB]">—</span>
                          ) : isUnassigned ? (
                            <span className="text-xs rounded-full px-2 py-0.5 bg-amber-100 text-amber-700 font-medium whitespace-nowrap">
                              Unassigned
                            </span>
                          ) : (
                            <span className="text-xs rounded-full px-2 py-0.5 bg-[#066880]/10 text-[#066880] font-medium whitespace-nowrap">
                              {providerName ?? "—"}
                            </span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Legend */}
      {hasAnyEntries && (
        <div className="flex flex-wrap gap-4 text-xs text-[#7A7A7A]">
          {(["balanced", "overstaffed", "prov_imbalance", "none"] as StaffingStatus[]).map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 rounded-full"
                style={{ backgroundColor: getStatusDotColor(s) }}
              />
              {getStatusLabel(s)}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
