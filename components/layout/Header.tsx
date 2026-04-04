"use client"

import Link from "next/link"
import { APP_NAME, ROUTES } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { useUser } from "@/hooks/useUser"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export function Header() {
  const { user, loading } = useUser()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(ROUTES.home)
  }

  return (
    <header className="border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href={ROUTES.home} className="text-xl font-bold">
          {APP_NAME}
        </Link>

        <nav className="flex items-center gap-4">
          {!loading && (
            <>
              {user ? (
                <>
                  <Link href={ROUTES.dashboard}>
                    <Button variant="ghost" size="sm">Dashboard</Button>
                  </Link>
                  <Button variant="outline" size="sm" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href={ROUTES.login}>
                    <Button variant="ghost" size="sm">Log In</Button>
                  </Link>
                  <Link href={ROUTES.register}>
                    <Button size="sm">Get Started</Button>
                  </Link>
                </>
              )}
            </>
          )}
        </nav>
      </div>
    </header>
  )
}
