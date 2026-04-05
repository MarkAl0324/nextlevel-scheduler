import { createClient } from "@/lib/supabase/server"
import { SwapBoard } from "@/components/swaps/SwapBoard"
import type { MA, SwapRequest } from "@/types"

export default async function SwapsPage() {
  const supabase = await createClient()

  const [{ data: mas }, { data: swaps }] = await Promise.all([
    supabase.from("mas").select("*").eq("active", true).order("name"),
    supabase.from("swap_requests").select("*").order("created_at", { ascending: false }),
  ])

  return (
    <SwapBoard
      mas={(mas ?? []) as MA[]}
      initialSwaps={(swaps ?? []) as SwapRequest[]}
    />
  )
}
