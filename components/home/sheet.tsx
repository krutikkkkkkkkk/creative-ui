import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/copy-command"

/* The classic home page is laid out as a printer's proof sheet. These are its few shared
   parts: the ruled section head, the one-line command and the marks around a plate. */

/** A heavy rule with the section's number and name set small, like a catalogue's running head. */
export function SectionHead({
  n,
  title,
  meta,
  className,
}: {
  n: string
  title: string
  meta?: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "flex items-baseline justify-between gap-6 border-t border-foreground pt-3 font-mono text-[11px] tracking-[.08em] uppercase",
        className
      )}
    >
      <h2 className="flex items-baseline gap-3">
        <span className="text-muted-foreground">{n}</span>
        {title}
      </h2>
      {meta && <p className="text-right text-muted-foreground">{meta}</p>}
    </div>
  )
}

/** A full sentence set large. Sections open with one of these instead of a slogan. */
export function Lead({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <p className={cn("font-serif text-3xl leading-[1.1] tracking-[-0.02em] text-pretty sm:text-[2.5rem]", className)}>
      {children}
    </p>
  )
}

/** A command on a single ruled line, with a copy button. */
export function CommandLine({ command, className }: { command: string; className?: string }) {
  return (
    <div className={cn("flex min-w-0 items-center gap-2 border-b border-foreground/25 pb-1.5", className)}>
      <code className="no-scrollbar min-w-0 flex-1 overflow-x-auto font-mono text-[13px] whitespace-nowrap">
        <span className="text-muted-foreground select-none">$ </span>
        {command}
      </code>
      <CopyButton value={command} label="Copy command" />
    </div>
  )
}

/** Crop marks at the four corners of a plate and a registration target on its top edge. */
export function PlateMarks({ className }: { className?: string }) {
  const corner = "absolute size-4 text-foreground/45"
  return (
    <div aria-hidden className={cn("pointer-events-none absolute -inset-3 sm:-inset-5", className)}>
      {[
        "top-0 left-0",
        "top-0 right-0 -scale-x-100",
        "bottom-0 left-0 -scale-y-100",
        "right-0 bottom-0 -scale-100",
      ].map((pos) => (
        <svg key={pos} viewBox="0 0 16 16" className={cn(corner, pos)} fill="none" stroke="currentColor" strokeWidth="1">
          <path d="M0 8.5H6M8.5 0V6" vectorEffect="non-scaling-stroke" />
        </svg>
      ))}
      <svg
        viewBox="0 0 16 16"
        className="absolute top-0 left-1/2 size-4 -translate-x-1/2 text-foreground/45 max-sm:hidden"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
      >
        <circle cx="8" cy="8" r="4.5" vectorEffect="non-scaling-stroke" />
        <path d="M0 8H16M8 0V16" vectorEffect="non-scaling-stroke" />
      </svg>
    </div>
  )
}

/** The inks on the sheet, as a printer's colour bar. */
export function ColourBar({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cn("flex", className)}>
      {["#241d17", "#6e2a24", "#b8893a", "#387478", "#0a2a6e", "#f4f1ea"].map((c) => (
        <span key={c} className="size-2.5 ring-1 ring-black/10 ring-inset" style={{ backgroundColor: c }} />
      ))}
    </span>
  )
}
