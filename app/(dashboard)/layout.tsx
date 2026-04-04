import { Sidebar } from "@/components/layout/Sidebar"
import { ROUTES } from "@/lib/constants"

const sidebarItems = [
  { label: "Dashboard", href: ROUTES.dashboard },
  // Add more nav items here as you build features
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen">
      <Sidebar items={sidebarItems} />
      <main className="flex flex-1 flex-col gap-6 p-8">
        {children}
      </main>
    </div>
  )
}
