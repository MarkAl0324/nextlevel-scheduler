import { APP_NAME } from "@/lib/constants"

type LogoProps = {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <span className={className}>
      {APP_NAME}
    </span>
  )
}
