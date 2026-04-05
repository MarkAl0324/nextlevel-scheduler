import { createClient } from "@/lib/supabase/server"
import { LoginForm } from "@/components/auth/LoginForm"
import { APP_NAME } from "@/lib/constants"
import type { MA } from "@/types"

export default async function LoginPage() {
  const supabase = await createClient()
  const { data: mas } = await supabase
    .from("mas")
    .select("*")
    .eq("active", true)
    .order("name")

  return (
    <div className="min-h-screen bg-[#FFFEF9] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#066880]">{APP_NAME}</h1>
          <p className="text-sm text-[#7A7A7A] mt-1">MA Scheduling</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#CCCACB] shadow-sm p-8">
          {(mas ?? []).length === 0 ? (
            <p className="text-center text-sm text-[#7A7A7A]">
              No staff found. Ask your manager to add MAs first.
            </p>
          ) : (
            <LoginForm mas={(mas ?? []) as MA[]} />
          )}
        </div>
      </div>
    </div>
  )
}
