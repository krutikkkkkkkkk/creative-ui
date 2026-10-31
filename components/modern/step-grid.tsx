import { cn } from "@/lib/utils"

export type GridStep = {
  n: string
  title: string
  body: string
  /** Optional UI under the copy: a command, a snippet. */
  visual?: React.ReactNode
}

/** Numbered steps side by side, split by hairlines. The modern counterpart of StackSteps. */
export function StepGrid({ steps, className }: { steps: GridStep[]; className?: string }) {
  return (
    <ol className={cn("grid gap-px overflow-hidden rounded-xl border bg-border md:grid-cols-3", className)}>
      {steps.map((s) => (
        <li key={s.n} className="flex min-w-0 flex-col gap-4 bg-background p-6 sm:p-8">
          <span className="grid size-7 place-items-center rounded-full border font-mono text-xs text-muted-foreground tabular-nums">
            {Number(s.n)}
          </span>
          <div>
            <h3 className="font-semibold tracking-[-0.02em]">{s.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">{s.body}</p>
          </div>
          {s.visual && <div className="mt-auto min-w-0 pt-2">{s.visual}</div>}
        </li>
      ))}
    </ol>
  )
}
