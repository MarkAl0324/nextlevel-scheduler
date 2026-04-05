"use client"

import { useState } from "react"
import { toast } from "sonner"
import type { Passcode } from "@/types"

type Props = {
  currentMonth: string
  existing: Passcode | null
}

export function PasscodeManager({ currentMonth, existing }: Props) {
  const [code, setCode] = useState(existing?.code ?? "")
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!code.trim()) return
    setIsSaving(true)
    try {
      const res = await fetch("/api/passcode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim(), valid_month: currentMonth }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to save passcode")
      toast.success(`Passcode for ${currentMonth} saved.`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[#CCCACB] bg-white shadow-sm p-8 max-w-sm space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-[#1A1618]">Monthly Passcode</h2>
        <p className="text-sm text-[#7A7A7A] mt-1">
          Set the code MAs will use to access the schedule for{" "}
          <span className="font-medium text-[#1A1618]">{currentMonth}</span>.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-[#1A1618]">Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. SCHED04"
            required
            className="w-full border border-[#CCCACB] rounded-lg px-3 py-2.5 text-sm text-[#1A1618] font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-[#066880]"
          />
        </div>
        <button
          type="submit"
          disabled={isSaving || !code.trim()}
          className="w-full px-4 py-2.5 rounded-2xl bg-[#066880] text-white text-sm font-semibold hover:bg-[#055570] transition-colors disabled:opacity-50"
        >
          {isSaving ? "Saving..." : existing ? "Update Passcode" : "Set Passcode"}
        </button>
      </form>

      {existing && (
        <p className="text-xs text-[#7A7A7A]">
          Current code: <span className="font-mono font-semibold text-[#1A1618]">{existing.code}</span>
        </p>
      )}
    </div>
  )
}
