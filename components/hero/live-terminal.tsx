"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type TerminalItem = { name: string; files: number; kind: "component" | "skill" }

const BRAND = "var(--brand)"

/**
 * A dark terminal widget that types the install command for each registry item,
 * prints the result, waits, then moves on to the next one.
 */
export function LiveTerminal({
  items,
  namespace,
  className,
}: {
  items: TerminalItem[]
  namespace: string
  className?: string
}) {
  const [index, setIndex] = React.useState(0)
  const [typed, setTyped] = React.useState(0)
  const [lines, setLines] = React.useState(0)
  const [reduce, setReduce] = React.useState(false)

  const item = items[index % Math.max(1, items.length)] ?? { name: "name", files: 1, kind: "component" }
  const command = `npx shadcn add ${namespace}/${item.name}`
  const done = typed >= command.length

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setReduce(mq.matches)
    sync()
    mq.addEventListener("change", sync)
    return () => mq.removeEventListener("change", sync)
  }, [])

  React.useEffect(() => {
    if (reduce) {
      setTyped(command.length)
      setLines(2)
      return
    }
    let t: number | undefined
    if (!done) {
      t = window.setTimeout(() => setTyped((n) => n + 1), 34 + Math.random() * 56)
    } else if (lines < 2) {
      t = window.setTimeout(() => setLines((n) => n + 1), lines === 0 ? 650 : 380)
    } else if (items.length > 1) {
      t = window.setTimeout(() => {
        setTyped(0)
        setLines(0)
        setIndex((i) => (i + 1) % items.length)
      }, 3400)
    }
    return () => window.clearTimeout(t)
  }, [typed, lines, done, reduce, command.length, items.length])

  const target = item.kind === "skill" ? ".claude/skills/" : "components/"

  return (
    <div
      className={cn(
        "w-[min(320px,78vw)] rounded-xl bg-[#111214] p-4 text-white shadow-[0_30px_60px_-20px_rgba(0,0,0,0.55)] ring-1 ring-white/10",
        className
      )}
      aria-live="polite"
    >
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-white/20" />
        <span className="size-2 rounded-full bg-white/20" />
        <span className="size-2 rounded-full bg-white/20" />
        <span className="ml-auto font-mono text-[10px] tracking-[.08em] text-white/50 uppercase">terminal</span>
      </div>
      <pre className="mt-3 min-h-[4.6rem] font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-white/80">
        <span className="text-white/40">$ </span>
        {command.slice(0, typed)}
        {!done && (
          <span className="hero-caret -mb-0.5 inline-block h-[1.1em] w-[0.55em] bg-white/70 align-baseline" />
        )}
        {lines >= 1 && (
          <>
            {"\n"}
            <span style={{ color: BRAND }}>✓</span> Resolved registry item
          </>
        )}
        {lines >= 2 && (
          <>
            {"\n"}
            <span style={{ color: BRAND }}>✓</span> {item.files} {item.files === 1 ? "file" : "files"} written to{" "}
            {target}
          </>
        )}
      </pre>
      {items.length > 1 && (
        <div className="mt-3 flex gap-1" aria-hidden>
          {items.map((it, i) => (
            <span
              key={it.name}
              className={cn(
                "h-0.5 flex-1 rounded-full transition-colors duration-500",
                i === index % items.length ? "bg-white/60" : "bg-white/15"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}
