import { cn } from "@/lib/utils"

export type GridStep = {
  n: string
  title: string
  body: string
  /** Optional UI under the copy: a command, a snippet. */
  visual?: React.ReactNode
}

/** Numbered steps side by side, each on a raised tile. The modern counterpart of StackSteps. */
export function StepGrid({ steps, className }: { steps: GridStep[]; className?: string }) {
  return (
    <ol className={cn("grid gap-4 md:grid-cols-3 sm:gap-5", className)}>
      {steps.map((s) => (
        <li key={s.n} className="soft-surface flex min-w-0 flex-col gap-5 rounded-[28px] p-6 sm:p-7">
          <span className="soft-well grid size-9 place-items-center rounded-full text-sm font-semibold text-foreground tabular-nums">
            {Number(s.n)}
          </span>
          <div>
            <h3 className="text-lg font-semibold tracking-[-0.02em]">{s.title}</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-pretty text-muted-foreground">{s.body}</p>
          </div>
          {s.visual && <div className="mt-auto min-w-0 pt-1">{s.visual}</div>}
        </li>
      ))}
    </ol>
  )
}
