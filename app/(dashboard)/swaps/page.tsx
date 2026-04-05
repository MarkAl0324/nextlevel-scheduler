import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { SwapBoard } from "@/components/swaps/SwapBoard"
import type { MA, SwapRequest } from "@/types"

async function getSessionMaId(): Promise<string | null> {
  const store = await cookies()
  const value = store.get("nextlevel_session")?.value
  if (!value) return null
  const [maId] = value.split(":")
  return maId || null
}

export default async function SwapsPage() {
  const supabase = await createClient()

  const [{ data: mas }, { data: swaps }, sessionMaId] = await Promise.all([
    supabase.from("mas").select("*").eq("active", true).order("name"),
    supabase.from("swap_requests").select("*").order("created_at", { ascending: false }),
    getSessionMaId(),
  ])

  return (
    <SwapBoard
      mas={(mas ?? []) as MA[]}
      initialSwaps={(swaps ?? []) as SwapRequest[]}
      sessionMaId={sessionMaId ?? undefined}
    />
  )
}
