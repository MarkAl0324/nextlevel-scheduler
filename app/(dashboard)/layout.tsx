import { Sidebar } from "@/components/layout/Sidebar"
import { ROUTES } from "@/lib/constants"
import { CalendarDays, ArrowLeftRight, Settings } from "lucide-react"

const sidebarItems = [
  { label: "Schedule", href: ROUTES.schedule, icon: CalendarDays },
  { label: "Swap Requests", href: ROUTES.swaps, icon: ArrowLeftRight },
  { label: "Admin", href: ROUTES.admin, icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-[#FFFEF9]">
      <Sidebar items={sidebarItems} />
      <main className="flex flex-1 flex-col gap-6 p-8">
        {children}
      </main>
    </div>
  )
}
