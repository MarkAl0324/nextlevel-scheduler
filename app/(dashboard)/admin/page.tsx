import { createClient } from "@/lib/supabase/server"
import { ScheduleBuilder } from "@/components/admin/ScheduleBuilder"
import type { MA, Provider, ScheduleEntry } from "@/types"

type Props = {
  searchParams: Promise<{ month?: string }>
}

function currentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export default async function AdminSchedulePage({ searchParams }: Props) {
  const { month: rawMonth } = await searchParams
  const month = rawMonth && /^\d{4}-\d{2}$/.test(rawMonth) ? rawMonth : currentMonth()

  const [year, m] = month.split("-").map(Number)
  const startDate = `${month}-01`
  const lastDay = new Date(year, m, 0).getDate()
  const endDate = `${month}-${String(lastDay).padStart(2, "0")}`

  const supabase = await createClient()

  const [{ data: mas }, { data: providers }, { data: entries }] = await Promise.all([
    supabase.from("mas").select("*").eq("active", true).order("name"),
    supabase.from("providers").select("*").eq("active", true).order("name"),
    supabase.from("schedule_entries").select("*").gte("date", startDate).lte("date", endDate),
  ])

  return (
    <ScheduleBuilder
      mas={(mas as MA[]) ?? []}
      providers={(providers as Provider[]) ?? []}
      initialEntries={(entries as ScheduleEntry[]) ?? []}
      month={month}
    />
  )
}
