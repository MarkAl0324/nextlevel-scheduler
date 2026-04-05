import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

type Params = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, { params }: Params) {
  const supabase = await createClient()
  const { id } = await params
  const body = await request.json()
  const { action, accepted_by_ma_id } = body

  if (!action) {
    return NextResponse.json({ error: "action is required" }, { status: 400 })
  }

  if (action === "accept") {
    if (!accepted_by_ma_id) {
      return NextResponse.json({ error: "accepted_by_ma_id is required for accept" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("swap_requests")
      .update({ status: "accepted", accepted_by_ma_id })
      .eq("id", id)
      .eq("status", "open")
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: "Request not found or already closed" }, { status: 404 })
    return NextResponse.json({ data })
  }

  if (action === "close") {
    const { data, error } = await supabase
      .from("swap_requests")
      .update({ status: "closed" })
      .eq("id", id)
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    if (!data) return NextResponse.json({ error: "Request not found" }, { status: 404 })
    return NextResponse.json({ data })
  }

  return NextResponse.json({ error: "action must be 'accept' or 'close'" }, { status: 400 })
}
