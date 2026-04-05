// ============================================================
// GLOBAL TYPES
// Add shared TypeScript types here. Project-specific types
// should live alongside their feature files.
// ============================================================

export type MA = {
  id: string
  name: string
  active: boolean
  created_at: string
}

export type Provider = {
  id: string
  name: string
  active: boolean
  created_at: string
}

export type Passcode = {
  id: string
  code: string
  valid_month: string // e.g. "2026-05"
  created_at: string
}

export type ScheduleEntry = {
  id: string
  date: string
  ma_id: string
  provider_id: string | null
  notes: string | null
  created_at: string
}

export type SwapRequest = {
  id: string
  requester_ma_id: string
  date: string
  swap_type: "1:1" | "leave"
  note: string | null
  status: "open" | "accepted" | "closed"
  accepted_by_ma_id: string | null
  created_at: string
}

export type ApiResponse<T> = {
  data: T | null
  error: string | null
}

export type NavItem = {
  label: string
  href: string
  icon?: React.ComponentType<{ className?: string }>
}
