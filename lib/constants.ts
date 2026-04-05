// ============================================================
// APP CONSTANTS
// Replace APP_NAME and APP_DESCRIPTION for each new project.
// ============================================================

export const APP_NAME = "NextLevel Scheduler"
export const APP_DESCRIPTION = "Internal scheduling app for Medical Assistants and providers"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const ROUTES = {
  home: "/",
  schedule: "/schedule",
  swaps: "/swaps",
  admin: "/admin",
  adminMas: "/admin/mas",
  adminProviders: "/admin/providers",
  adminPasscode: "/admin/passcode",
} as const
