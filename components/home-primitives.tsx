import Link from "next/link"

import { cn } from "@/lib/utils"

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

export function PillLink({
  href,
  external,
  variant = "outline",
  className,
  children,
}: {
  href: string
  external?: boolean
  variant?: "solid" | "outline" | "light" | "ghost-dark"
  className?: string
  children: React.ReactNode
}) {
  const classes = cn(
    "inline-flex h-11 items-center gap-2 rounded-full px-5 font-mono text-[11px] tracking-[.08em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    variant === "solid" && "bg-foreground text-background hover:bg-foreground/85",
    variant === "outline" && "border bg-background/60 hover:bg-accent",
    variant === "light" && "bg-white text-[#111214] hover:bg-white/85",
    variant === "ghost-dark" && "border border-white/20 text-white hover:bg-white/10",
    className
  )
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={classes}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  )
}
