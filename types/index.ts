// ============================================================
// GLOBAL TYPES
// Add shared TypeScript types here. Project-specific types
// should live alongside their feature files.
// ============================================================

export type User = {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
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
