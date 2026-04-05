"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { cn } from "@/lib/utils"
import { APP_NAME } from "@/lib/constants"
import type { NavItem } from "@/types"

type SidebarProps = {
  items: NavItem[]
}

export function Sidebar({ items }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleLock() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/")
  }

  function isActive(href: string) {
    return pathname === href || pathname.startsWith(href + "/")
  }

  return (
    <aside className="flex w-64 flex-col border-r border-[#CCCACB] bg-[#FFFEF9] px-4 py-6 shrink-0">
      {/* Logo */}
      <div className="px-3 mb-6">
        <span className="text-base font-bold text-[#066880]">{APP_NAME}</span>
      </div>

      <div className="h-px bg-[#CCCACB] mb-4" />

      <nav className="flex flex-col gap-1">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive(item.href)
                ? "border-l-2 border-[#066880] text-[#066880] bg-[#066880]/5 pl-[10px]"
                : "text-[#4E545B] hover:bg-[#066880]/5 hover:text-[#066880]"
            )}
          >
            {item.icon && <item.icon className="h-4 w-4 shrink-0" />}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
