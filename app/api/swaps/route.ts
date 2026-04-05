import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("swap_requests")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const body = await request.json()
  const { requester_ma_id, date, swap_type, note } = body

  if (!requester_ma_id || !date || !swap_type) {
    return NextResponse.json({ error: "requester_ma_id, date, and swap_type are required" }, { status: 400 })
  }

  if (!["1:1", "leave"].includes(swap_type)) {
    return NextResponse.json({ error: "swap_type must be '1:1' or 'leave'" }, { status: 400 })
  }

  const { data, error } = await supabase
    .from("swap_requests")
    .insert({
      requester_ma_id,
      date,
      swap_type,
      note: note?.trim() || null,
      status: "open",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}
