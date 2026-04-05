import { createClient } from "@/lib/supabase/server"
import { PasscodeManager } from "@/components/admin/PasscodeManager"
import type { Passcode } from "@/types"

function getCurrentMonth() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
}

export default async function PasscodePage() {
  const supabase = await createClient()
  const currentMonth = getCurrentMonth()

  const { data } = await supabase
    .from("passcodes")
    .select("*")
    .eq("valid_month", currentMonth)
    .single()

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-[#1A1618]">Manage Passcode</h1>
      <PasscodeManager
        currentMonth={currentMonth}
        existing={(data as Passcode) ?? null}
      />
    </div>
  )
}
