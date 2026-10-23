import Link from "next/link"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

/* Small Classical Collage primitives shared by the home page and its hero. */

export const GOLD = "#B8893A"

export function delay(ms: number) {
  return { "--cc-delay": `${ms}ms` } as React.CSSProperties
}

export function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase", className)}>
      {"// "}
      {children}
    </p>
  )
}

/* Variants map onto shadcn Button variants; "light" and "ghost-dark" sit on dark panels. */
const PILL_VARIANT = {
  solid: { variant: "default", className: undefined },
  outline: { variant: "outline", className: "bg-background/60" },
  light: { variant: "default", className: "bg-white text-[#111214] hover:bg-white/85" },
  "ghost-dark": {
    variant: "ghost",
    className: "border border-white/20 text-white hover:bg-white/10 hover:text-white dark:hover:bg-white/10",
  },
} as const

const PILL = "h-11 gap-2 rounded-full px-5 font-mono text-[11px] font-normal tracking-[.08em] uppercase has-[>svg]:px-5"

export function PillLink({
  href,
  external,
  variant = "outline",
  className,
  children,
}: {
  href: string
  external?: boolean
  variant?: keyof typeof PILL_VARIANT
  className?: string
  children: React.ReactNode
}) {
  const pill = PILL_VARIANT[variant]
  return (
    <Button asChild variant={pill.variant} className={cn(PILL, pill.className, className)}>
      {external ? (
        <a href={href} target="_blank" rel="noreferrer">
          {children}
        </a>
      ) : (
        <Link href={href}>{children}</Link>
      )}
    </Button>
  )
}

/** PillLink's look on a real button, for form submits. */
export function PillButton({
  variant = "outline",
  className,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "variant"> & { variant?: keyof typeof PILL_VARIANT }) {
  const pill = PILL_VARIANT[variant]
  return <Button variant={pill.variant} className={cn(PILL, pill.className, className)} {...props} />
}
