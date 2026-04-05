import { NextResponse, type NextRequest } from "next/server"

const PROTECTED = ["/schedule", "/swaps", "/admin"]
const UNPROTECTED = ["/", "/setup"] // explicitly never redirect these

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function getSession(request: NextRequest): { maId: string; month: string } | null {
  const value = request.cookies.get("nextlevel_session")?.value
  if (!value) return null
  const [maId, month] = value.split(":")
  if (!maId || !month) return null
  return { maId, month }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const session = getSession(request)
  const currentMonth = getCurrentMonth()
  const isValid = session !== null && session.month === currentMonth

  // Redirect authenticated users away from login page
  if (pathname === "/" && isValid) {
    return NextResponse.redirect(new URL("/schedule", request.url))
  }

  // Protect dashboard routes
  if (PROTECTED.some((r) => pathname.startsWith(r))) {
    if (!isValid) {
      return NextResponse.redirect(new URL("/", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
