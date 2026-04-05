import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// GET /api/schedule?month=2026-05
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const month = searchParams.get("month")

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Invalid month format. Use YYYY-MM." }, { status: 400 })
  }

  const [year, m] = month.split("-").map(Number)
  const startDate = `${month}-01`
  const lastDay = new Date(year, m, 0).getDate()
  const endDate = `${month}-${String(lastDay).padStart(2, "0")}`

  const supabase = await createClient()
  const { data, error } = await supabase
    .from("schedule_entries")
    .select("*")
    .gte("date", startDate)
    .lte("date", endDate)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/schedule
// Body: { month: "2026-05", entries: [{ date, ma_id, provider_id: string | null }] }
// Replaces all entries for the month — deletes first, then inserts non-off rows.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { month, entries } = await request.json()

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json({ error: "Invalid month format." }, { status: 400 })
  }

  const [year, m] = month.split("-").map(Number)
  const startDate = `${month}-01`
  const lastDay = new Date(year, m, 0).getDate()
  const endDate = `${month}-${String(lastDay).padStart(2, "0")}`

  // Delete all existing entries for the month
  const { error: deleteError } = await supabase
    .from("schedule_entries")
    .delete()
    .gte("date", startDate)
    .lte("date", endDate)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  // Insert non-off entries (entries array excludes "off" cells — only working MAs)
  if (entries && entries.length > 0) {
    const { error: insertError } = await supabase
      .from("schedule_entries")
      .insert(entries)

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
