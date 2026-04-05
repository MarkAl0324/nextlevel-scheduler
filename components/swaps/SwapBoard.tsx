"use client"

import { useState, useEffect, useCallback } from "react"
import { toast } from "sonner"
import type { MA, SwapRequest } from "@/types"

type Props = {
  mas: MA[]
  initialSwaps: SwapRequest[]
  sessionMaId?: string // provided once login is active; hides the "Viewing as" selector
}

const STORAGE_KEY = "nextlevel_viewer_ma_id"

const SWAP_TYPE_LABELS: Record<SwapRequest["swap_type"], string> = {
  "1:1": "1:1 Swap",
  "leave": "Leave Request",
}

const SWAP_TYPE_COLORS: Record<SwapRequest["swap_type"], string> = {
  "1:1": "bg-[#3B82F6]/10 text-[#3B82F6]",
  "leave": "bg-[#F59E0B]/10 text-[#F59E0B]",
}

const STATUS_COLORS: Record<SwapRequest["status"], string> = {
  "open": "bg-green-100 text-green-800",
  "accepted": "bg-[#066880]/10 text-[#066880]",
  "closed": "bg-gray-100 text-gray-500",
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", weekday: "long" })
}

export function SwapBoard({ mas, initialSwaps, sessionMaId }: Props) {
  const [swaps, setSwaps] = useState<SwapRequest[]>(initialSwaps)
  const [viewerMaId, setViewerMaId] = useState<string>("")
  const [showModal, setShowModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [acceptingId, setAcceptingId] = useState<string | null>(null)
  const [closingId, setClosingId] = useState<string | null>(null)

  // Modal form state
  const [formDate, setFormDate] = useState("")
  const [formType, setFormType] = useState<SwapRequest["swap_type"]>("1:1")
  const [formNote, setFormNote] = useState("")

  // If session MA is provided (login active), use it directly.
  // Otherwise fall back to localStorage for the pre-auth "Viewing as" flow.
  useEffect(() => {
    if (sessionMaId) {
      setViewerMaId(sessionMaId)
      return
    }
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && mas.find((m) => m.id === stored)) {
      setViewerMaId(stored)
    } else if (mas.length > 0) {
      setViewerMaId(mas[0].id)
      localStorage.setItem(STORAGE_KEY, mas[0].id)
    }
  }, [mas, sessionMaId])

  function handleViewerChange(id: string) {
    setViewerMaId(id)
    localStorage.setItem(STORAGE_KEY, id)
  }

  const maMap = Object.fromEntries(mas.map((m) => [m.id, m.name]))

  const openSwaps = swaps.filter((s) => s.status === "open" && s.requester_ma_id !== viewerMaId)
  const mySwaps = swaps.filter((s) => s.requester_ma_id === viewerMaId)

  const handleAccept = useCallback(async (swapId: string) => {
    if (!viewerMaId) return
    setAcceptingId(swapId)
    try {
      const res = await fetch(`/api/swaps/${swapId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "accept", accepted_by_ma_id: viewerMaId }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to accept request")
      setSwaps((prev) => prev.map((s) => (s.id === swapId ? json.data : s)))
      toast.success("Request accepted. Notify your manager to update the schedule.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setAcceptingId(null)
    }
  }, [viewerMaId])

  const handleClose = useCallback(async (swapId: string) => {
    setClosingId(swapId)
    try {
      const res = await fetch(`/api/swaps/${swapId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "close" }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to close request")
      setSwaps((prev) => prev.map((s) => (s.id === swapId ? json.data : s)))
      toast.success("Request closed.")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setClosingId(null)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!viewerMaId || !formDate) return
    setIsSubmitting(true)
    try {
      const res = await fetch("/api/swaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requester_ma_id: viewerMaId,
          date: formDate,
          swap_type: formType,
          note: formNote,
        }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to post request")
      setSwaps((prev) => [json.data, ...prev])
      setShowModal(false)
      setFormDate("")
      setFormType("1:1")
      setFormNote("")
      toast.success("Request posted!")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-3xl font-bold text-[#1A1618]">Swap Requests</h1>
        <button
          onClick={() => setShowModal(true)}
          disabled={!viewerMaId}
          className="px-4 py-2 rounded-2xl bg-[#066880] text-white text-sm font-semibold hover:bg-[#055570] transition-colors disabled:opacity-50"
        >
          + Post a Request
        </button>
      </div>

      {/* Viewing as selector — only shown before passcode login is active */}
      {!sessionMaId && (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-[#CCCACB] bg-[#FFFEF9] text-sm">
          <span className="text-[#7A7A7A]">Viewing as:</span>
          <select
            value={viewerMaId}
            onChange={(e) => handleViewerChange(e.target.value)}
            className="border border-[#CCCACB] rounded-lg px-3 py-1 bg-white text-[#1A1618] focus:outline-none focus:ring-2 focus:ring-[#066880]"
          >
            {mas.map((ma) => (
              <option key={ma.id} value={ma.id}>{ma.name}</option>
            ))}
          </select>
          <span className="text-[#7A7A7A] text-xs">(Temporary — replaced by login in a future update)</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Open Requests */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1618]">Open Requests</h2>
          {openSwaps.length === 0 ? (
            <div className="rounded-2xl border border-[#CCCACB] bg-white p-8 text-center text-sm text-[#7A7A7A]">
              No open requests right now.
            </div>
          ) : (
            openSwaps.map((swap) => (
              <SwapCard
                key={swap.id}
                swap={swap}
                maName={maMap[swap.requester_ma_id] ?? "Unknown"}
                acceptedByName={swap.accepted_by_ma_id ? (maMap[swap.accepted_by_ma_id] ?? "Unknown") : null}
                showAccept
                isAccepting={acceptingId === swap.id}
                onAccept={() => handleAccept(swap.id)}
              />
            ))
          )}
        </section>

        {/* My Requests */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1A1618]">My Requests</h2>
          {mySwaps.length === 0 ? (
            <div className="rounded-2xl border border-[#CCCACB] bg-white p-8 text-center text-sm text-[#7A7A7A]">
              You haven&apos;t posted any requests yet.
            </div>
          ) : (
            mySwaps.map((swap) => (
              <SwapCard
                key={swap.id}
                swap={swap}
                maName={maMap[swap.requester_ma_id] ?? "Unknown"}
                acceptedByName={swap.accepted_by_ma_id ? (maMap[swap.accepted_by_ma_id] ?? "Unknown") : null}
                showAccept={false}
                showClose={swap.status === "open"}
                isClosing={closingId === swap.id}
                onClose={() => handleClose(swap.id)}
              />
            ))
          )}
        </section>
      </div>

      {/* Post Request Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8 space-y-5">
            <h2 className="text-xl font-semibold text-[#1A1618]">Post a Request</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Date */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1A1618]">Date</label>
                <input
                  type="date"
                  required
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full border border-[#CCCACB] rounded-lg px-3 py-2 text-sm text-[#1A1618] focus:outline-none focus:ring-2 focus:ring-[#066880]"
                />
              </div>

              {/* Type */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1A1618]">Type</label>
                <div className="flex gap-4">
                  {(["1:1", "leave"] as const).map((t) => (
                    <label key={t} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input
                        type="radio"
                        name="swap_type"
                        value={t}
                        checked={formType === t}
                        onChange={() => setFormType(t)}
                        className="accent-[#066880]"
                      />
                      {SWAP_TYPE_LABELS[t]}
                    </label>
                  ))}
                </div>
              </div>

              {/* Note */}
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-[#1A1618]">Note <span className="text-[#7A7A7A] font-normal">(optional)</span></label>
                <textarea
                  value={formNote}
                  onChange={(e) => setFormNote(e.target.value)}
                  rows={3}
                  placeholder="Any context for your teammates..."
                  className="w-full border border-[#CCCACB] rounded-lg px-3 py-2 text-sm text-[#1A1618] placeholder:text-[#7A7A7A] focus:outline-none focus:ring-2 focus:ring-[#066880] resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 rounded-2xl border border-[#CCCACB] text-sm font-semibold text-[#4E545B] hover:bg-[#F5F5F5] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !formDate}
                  className="flex-1 px-4 py-2 rounded-2xl bg-[#066880] text-white text-sm font-semibold hover:bg-[#055570] transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "Posting..." : "Submit Request"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Swap Card ───────────────────────────────────────────────────────────────

type SwapCardProps = {
  swap: SwapRequest
  maName: string
  acceptedByName: string | null
  showAccept: boolean
  showClose?: boolean
  isAccepting?: boolean
  isClosing?: boolean
  onAccept?: () => void
  onClose?: () => void
}

function SwapCard({
  swap,
  maName,
  acceptedByName,
  showAccept,
  showClose = false,
  isAccepting = false,
  isClosing = false,
  onAccept,
  onClose,
}: SwapCardProps) {
  return (
    <div className="rounded-2xl border border-[#CCCACB] bg-white shadow-sm p-5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-[#1A1618]">{maName}</p>
          <p className="text-sm text-[#4E545B]">{formatDate(swap.date)}</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${SWAP_TYPE_COLORS[swap.swap_type]}`}>
            {SWAP_TYPE_LABELS[swap.swap_type]}
          </span>
          <span className={`text-xs font-semibold rounded-full px-2.5 py-1 ${STATUS_COLORS[swap.status]}`}>
            {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
          </span>
        </div>
      </div>

      {swap.note && (
        <p className="text-sm text-[#4E545B] italic">&ldquo;{swap.note}&rdquo;</p>
      )}

      {swap.status === "accepted" && acceptedByName && (
        <p className="text-xs text-[#066880] font-medium">Accepted by {acceptedByName}</p>
      )}

      {(showAccept && swap.status === "open") || showClose ? (
        <div className="flex gap-2 pt-1">
          {showAccept && swap.status === "open" && (
            <button
              onClick={onAccept}
              disabled={isAccepting}
              className="px-4 py-1.5 rounded-2xl bg-[#066880] text-white text-sm font-semibold hover:bg-[#055570] transition-colors disabled:opacity-50"
            >
              {isAccepting ? "Accepting..." : "Accept"}
            </button>
          )}
          {showClose && (
            <button
              onClick={onClose}
              disabled={isClosing}
              className="px-4 py-1.5 rounded-2xl border border-[#CCCACB] text-sm font-semibold text-[#4E545B] hover:bg-[#F5F5F5] transition-colors disabled:opacity-50"
            >
              {isClosing ? "Closing..." : "Close"}
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}
