import { createClient } from "@/lib/supabase/server"
import { ScheduleGrid } from "@/components/schedule/ScheduleGrid"
import type { MA, Provider, ScheduleEntry } from "@/types"

type Props = {
  searchParams: { month?: string }
}

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

function isValidMonth(month: string) {
  return /^\d{4}-\d{2}$/.test(month)
}

export default async function SchedulePage({ searchParams }: Props) {
  const month = searchParams.month && isValidMonth(searchParams.month)
    ? searchParams.month
    : getCurrentMonth()

  const [year, m] = month.split("-").map(Number)
  const startDate = `${month}-01`
  const lastDay = new Date(year, m, 0).getDate()
  const endDate = `${month}-${String(lastDay).padStart(2, "0")}`

  const supabase = createServerClient()

  const [{ data: mas }, { data: providers }, { data: entries }] = await Promise.all([
    supabase.from("mas").select("*").eq("active", true).order("name"),
    supabase.from("providers").select("*").eq("active", true).order("name"),
    supabase.from("schedule_entries").select("*").gte("date", startDate).lte("date", endDate),
  ])

  return (
    <ScheduleGrid
      mas={(mas ?? []) as MA[]}
      providers={(providers ?? []) as Provider[]}
      entries={(entries ?? []) as ScheduleEntry[]}
      month={month}
    />
  )
}
