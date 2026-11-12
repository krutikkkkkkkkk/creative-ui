import { cn } from "@/lib/utils"

/* Building blocks for the modern look: a centred column on the grey canvas, sections set apart
   by space instead of rules, raised white tiles, and quiet sans headings. */

export function enter(ms: number) {
  return { "--mo-delay": `${ms}ms` } as React.CSSProperties
}

/** The page column. */
export function Rails({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-[calc(100%-2rem)] max-w-6xl", className)}>{children}</div>
}

/** A section of the page. */
export function Band({ id, className, children }: { id?: string; className?: string; children: React.ReactNode }) {
  return (
    <section id={id} className={cn("relative scroll-mt-24 py-12 sm:py-16", className)}>
      {children}
    </section>
  )
}

/** A raised tile: the look's basic surface. Corners are large on purpose. */
export function Tile({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("soft-surface rounded-[28px]", className)} {...props} />
}

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("text-xs font-semibold tracking-[0.06em] text-muted-foreground/75 uppercase", className)}>{children}</p>
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
        <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-balance sm:text-[2.75rem] sm:leading-[1.05]">
          {title}
        </h2>
        {description && (
          <p className="mt-4 max-w-[56ch] text-lg leading-relaxed text-pretty text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  )
}

/** A sentence set like a notification: quiet by default, with the words that matter in `<b>`. */
export function Quiet({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "leading-snug tracking-[-0.01em] text-pretty text-muted-foreground [&_b]:font-medium [&_b]:text-foreground",
        className
      )}
      {...props}
    />
  )
}
