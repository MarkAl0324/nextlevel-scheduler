import Link from "next/link"
import { Header } from "@/components/layout/Header"
import { Footer } from "@/components/layout/Footer"
import { Button } from "@/components/ui/button"
import { APP_NAME, APP_DESCRIPTION, ROUTES } from "@/lib/constants"

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex flex-1 flex-col items-center justify-center px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          {APP_NAME}
        </h1>
        <p className="mt-4 max-w-xl text-lg text-muted-foreground">
          {APP_DESCRIPTION}
        </p>
        <div className="mt-8 flex gap-4">
          <Link href={ROUTES.register}>
            <Button size="lg">Get Started</Button>
          </Link>
          <Link href={ROUTES.login}>
            <Button size="lg" variant="outline">Log In</Button>
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  )
}
