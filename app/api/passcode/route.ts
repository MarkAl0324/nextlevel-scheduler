import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("passcodes")
    .select("*")
    .order("valid_month", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { code, valid_month } = await request.json()

  if (!code?.trim() || !valid_month) {
    return NextResponse.json({ error: "code and valid_month are required" }, { status: 400 })
  }

  if (!/^\d{4}-\d{2}$/.test(valid_month)) {
    return NextResponse.json({ error: "valid_month must be YYYY-MM" }, { status: 400 })
  }

  // Upsert: update if month already exists, insert if not
  const { data, error } = await supabase
    .from("passcodes")
    .upsert({ code: code.trim(), valid_month }, { onConflict: "valid_month" })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
