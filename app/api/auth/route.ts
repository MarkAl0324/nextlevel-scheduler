import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { passcode, ma_id } = await request.json()

  if (!passcode?.trim() || !ma_id) {
    return NextResponse.json({ error: "Passcode and MA selection are required" }, { status: 400 })
  }

  const month = getCurrentMonth()

  const { data } = await supabase
    .from("passcodes")
    .select("id")
    .eq("code", passcode.trim())
    .eq("valid_month", month)
    .single()

  if (!data) {
    return NextResponse.json({ error: "Incorrect code. Try again." }, { status: 401 })
  }

  // Set session cookie: ma_id:month
  const cookieStore = await cookies()
  cookieStore.set("nextlevel_session", `${ma_id}:${month}`, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 31, // 31 days
  })

  return NextResponse.json({ success: true })
}
