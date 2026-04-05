import { createClient } from "@/lib/supabase/server"
import { MemberList } from "@/components/admin/MemberList"
import type { MA } from "@/types"

export default async function ManageMAsPage() {
  const supabase = await createClient()
  const { data: mas } = await supabase
    .from("mas")
    .select("*")
    .order("name", { ascending: true })

  return (
    <div className="max-w-xl">
      <h1 className="text-3xl font-bold text-[#1A1618] mb-8">
        Manage Medical Assistants
      </h1>
      <MemberList
        initialMembers={(mas as MA[]) ?? []}
        apiPath="/api/mas"
        label="MA"
      />
    </div>
  )
}
