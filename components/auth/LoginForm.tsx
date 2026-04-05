"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { MA } from "@/types"

type Props = {
  mas: MA[]
}

export function LoginForm({ mas }: Props) {
  const router = useRouter()
  const [maId, setMaId] = useState(mas[0]?.id ?? "")
  const [passcode, setPasscode] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode, ma_id: maId }),
      })
      const json = await res.json()

      if (!res.ok) {
        setError(json.error ?? "Something went wrong")
        return
      }

      router.push("/schedule")
    } catch {
      setError("Unable to connect. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* MA selector */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[#1A1618]">Who are you?</label>
        <select
          value={maId}
          onChange={(e) => setMaId(e.target.value)}
          required
          className="w-full border border-[#CCCACB] rounded-lg px-3 py-2.5 text-sm text-[#1A1618] bg-white focus:outline-none focus:ring-2 focus:ring-[#066880]"
        >
          {mas.map((ma) => (
            <option key={ma.id} value={ma.id}>{ma.name}</option>
          ))}
        </select>
      </div>

      {/* Passcode input */}
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-[#1A1618]">
          Enter this month&apos;s code
        </label>
        <input
          type="text"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          placeholder="_ _ _ _ _ _"
          required
          autoComplete="off"
          className={`w-full border rounded-lg px-3 py-3 text-center text-xl font-mono tracking-widest text-[#1A1618] focus:outline-none focus:ring-2 focus:ring-[#066880] ${
            error ? "border-[#EF4444]" : "border-[#CCCACB]"
          }`}
        />
        {error && (
          <p className="text-sm text-[#EF4444]">{error}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading || !passcode.trim() || !maId}
        className="w-full px-4 py-3 rounded-2xl bg-[#066880] text-white font-semibold hover:bg-[#055570] transition-colors disabled:opacity-50"
      >
        {isLoading ? "Checking..." : "Enter →"}
      </button>

      <p className="text-center text-xs text-[#7A7A7A]">
        Contact your manager if you don&apos;t have the code.
      </p>
    </form>
  )
}
