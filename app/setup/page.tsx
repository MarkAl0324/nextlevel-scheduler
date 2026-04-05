"use client"

import { useState } from "react"

// ─── Setup Page ───────────────────────────────────────────────────────────────
// No auth required. Used to seed initial data (MAs, providers, passcode)
// so the app is usable without needing direct DB access.
// ─────────────────────────────────────────────────────────────────────────────

type Entry = { name: string; saved: boolean; error: string }

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export default function SetupPage() {
  const currentMonth = getCurrentMonth()

  // MA entries
  const [maRows, setMaRows] = useState<Entry[]>([{ name: "", saved: false, error: "" }])
  // Provider entries
  const [provRows, setProvRows] = useState<Entry[]>([{ name: "", saved: false, error: "" }])
  // Passcode
  const [passcode, setPasscode] = useState("")
  const [passcodeSaved, setPasscodeSaved] = useState(false)
  const [passcodeError, setPasscodeError] = useState("")

  async function saveMA(idx: number) {
    const name = maRows[idx].name.trim()
    if (!name) return
    setMaRows((prev) => prev.map((r, i) => i === idx ? { ...r, error: "" } : r))
    const res = await fetch("/api/mas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    const json = await res.json()
    if (!res.ok) {
      setMaRows((prev) => prev.map((r, i) => i === idx ? { ...r, error: json.error } : r))
    } else {
      setMaRows((prev) => prev.map((r, i) => i === idx ? { ...r, saved: true } : r))
    }
  }

  async function saveProv(idx: number) {
    const name = provRows[idx].name.trim()
    if (!name) return
    setProvRows((prev) => prev.map((r, i) => i === idx ? { ...r, error: "" } : r))
    const res = await fetch("/api/providers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    })
    const json = await res.json()
    if (!res.ok) {
      setProvRows((prev) => prev.map((r, i) => i === idx ? { ...r, error: json.error } : r))
    } else {
      setProvRows((prev) => prev.map((r, i) => i === idx ? { ...r, saved: true } : r))
    }
  }

  async function savePasscode() {
    if (!passcode.trim()) return
    setPasscodeError("")
    const res = await fetch("/api/passcode", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: passcode.trim(), valid_month: currentMonth }),
    })
    const json = await res.json()
    if (!res.ok) setPasscodeError(json.error)
    else setPasscodeSaved(true)
  }

  return (
    <div className="min-h-screen bg-[#FFFEF9] p-8">
      <div className="max-w-2xl mx-auto space-y-10">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold text-[#1A1618]">Initial Setup</h1>
          <p className="text-sm text-[#7A7A7A]">
            Add your MAs, providers, and set the monthly passcode. No login required.
            Remove or protect this page before sharing the app publicly.
          </p>
          <div className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-xs font-medium rounded-full mt-2">
            ⚠ Dev/setup page — not for staff use
          </div>
        </div>

        {/* MAs */}
        <Section title="Medical Assistants">
          {maRows.map((row, idx) => (
            <Row
              key={idx}
              value={row.name}
              saved={row.saved}
              error={row.error}
              placeholder="MA name (e.g. Tricia)"
              onChange={(v) => setMaRows((prev) => prev.map((r, i) => i === idx ? { ...r, name: v, saved: false } : r))}
              onSave={() => saveMA(idx)}
            />
          ))}
          <button
            onClick={() => setMaRows((prev) => [...prev, { name: "", saved: false, error: "" }])}
            className="text-sm text-[#066880] hover:underline"
          >
            + Add another MA
          </button>
        </Section>

        {/* Providers */}
        <Section title="Providers">
          {provRows.map((row, idx) => (
            <Row
              key={idx}
              value={row.name}
              saved={row.saved}
              error={row.error}
              placeholder="Provider name (e.g. Dr. Smith)"
              onChange={(v) => setProvRows((prev) => prev.map((r, i) => i === idx ? { ...r, name: v, saved: false } : r))}
              onSave={() => saveProv(idx)}
            />
          ))}
          <button
            onClick={() => setProvRows((prev) => [...prev, { name: "", saved: false, error: "" }])}
            className="text-sm text-[#066880] hover:underline"
          >
            + Add another provider
          </button>
        </Section>

        {/* Passcode */}
        <Section title={`Passcode for ${currentMonth}`}>
          <div className="flex gap-2 items-start">
            <div className="flex-1 space-y-1">
              <input
                type="text"
                value={passcode}
                onChange={(e) => { setPasscode(e.target.value); setPasscodeSaved(false) }}
                placeholder="e.g. SCHED04"
                className="w-full border border-[#CCCACB] rounded-lg px-3 py-2 text-sm font-mono tracking-wider text-[#1A1618] focus:outline-none focus:ring-2 focus:ring-[#066880]"
              />
              {passcodeError && <p className="text-xs text-[#EF4444]">{passcodeError}</p>}
            </div>
            <SaveButton saved={passcodeSaved} onClick={savePasscode} disabled={!passcode.trim()} />
          </div>
        </Section>

        {/* Done */}
        <div className="pt-4 border-t border-[#CCCACB]">
          <a
            href="/"
            className="inline-block px-6 py-3 rounded-2xl bg-[#066880] text-white font-semibold text-sm hover:bg-[#055570] transition-colors"
          >
            Done → Go to Login
          </a>
        </div>

      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold text-[#1A1618]">{title}</h2>
      <div className="rounded-2xl border border-[#CCCACB] bg-white shadow-sm p-5 space-y-3">
        {children}
      </div>
    </div>
  )
}

function Row({
  value, saved, error, placeholder, onChange, onSave,
}: {
  value: string; saved: boolean; error: string; placeholder: string
  onChange: (v: string) => void; onSave: () => void
}) {
  return (
    <div className="space-y-1">
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSave()}
          placeholder={placeholder}
          className="flex-1 border border-[#CCCACB] rounded-lg px-3 py-2 text-sm text-[#1A1618] focus:outline-none focus:ring-2 focus:ring-[#066880]"
        />
        <SaveButton saved={saved} onClick={onSave} disabled={!value.trim()} />
      </div>
      {error && <p className="text-xs text-[#EF4444]">{error}</p>}
    </div>
  )
}

function SaveButton({ saved, onClick, disabled }: { saved: boolean; onClick: () => void; disabled: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors shrink-0 ${
        saved
          ? "bg-green-100 text-green-700 cursor-default"
          : "bg-[#066880] text-white hover:bg-[#055570] disabled:opacity-40"
      }`}
    >
      {saved ? "✓ Saved" : "Save"}
    </button>
  )
}
