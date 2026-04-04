// ============================================================
// APP CONSTANTS
// Replace APP_NAME and APP_DESCRIPTION for each new project.
// ============================================================

export const APP_NAME = "My App"
export const APP_DESCRIPTION = "Built with the Pipeline Template"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  dashboard: "/dashboard",
} as const
