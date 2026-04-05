import { createClient } from "@/lib/supabase/server"
import { MemberList } from "@/components/admin/MemberList"
import type { Provider } from "@/types"

export default async function ManageProvidersPage() {
  const supabase = await createClient()
  const { data: providers } = await supabase
    .from("providers")
    .select("*")
    .order("name", { ascending: true })

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold text-[#1A1618] mb-8">
        Manage Providers
      </h1>
      <MemberList
        initialMembers={(providers as Provider[]) ?? []}
        apiPath="/api/providers"
        label="Provider"
      />
    </div>
  )
}
