import { cn } from "@/lib/utils"

/* Building blocks for the modern look: a boxed page with hairline rails, sections split by
   rules with a plus mark at each corner, and quiet sans headings. */

export function enter(ms: number) {
  return { "--mo-delay": `${ms}ms` } as React.CSSProperties
}

/** The page frame: a centred column with a hairline down each side. */
export function Rails({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-[calc(100%-2rem)] max-w-6xl border-x", className)}>{children}</div>
}

export function PlusMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 13 13"
      className={cn("pointer-events-none absolute z-10 size-[13px] text-foreground/35", className)}
    >
      <path d="M6.5 0v13M0 6.5h13" stroke="currentColor" strokeWidth="1" />
    </svg>
  )
}

/** A section opened by a rule, with a plus where the rule meets each rail. */
export function Band({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn("relative scroll-mt-16 border-t", className)}>
      <PlusMark className="-top-[7px] -left-[7px]" />
      <PlusMark className="-top-[7px] -right-[7px]" />
      {children}
    </section>
  )
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-xs tracking-wide text-muted-foreground uppercase", className)}>{children}</p>
  )
}

export function BandHeader({
  label,
  title,
  description,
  action,
  className,
}: {
  label: string
  title: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-6", className)}>
      <div className="max-w-2xl">
        <Label>{label}</Label>
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-4xl">{title}</h2>
        {description && (
          <p className="mt-3 max-w-[56ch] leading-relaxed text-pretty text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}
