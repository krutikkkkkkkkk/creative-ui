"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/copy-command"

/* The modern hero's product shot: a window where the shadcn CLI installs a piece and its preview
   develops beside the terminal. It plays through the showpieces on its own; picking a chip takes
   over. Each run is pure CSS keyed by `run`; JS only chooses the item and leans the window
   toward the pointer. */

export type StageItem = { name: string; title: string; poster: string; fileCount: number }

const CHAR_MS = 24
const TICK_MS = 260 // gap between the CLI's output lines
const HOLD_MS = 3400 // how long a finished install stays up before the next one

function timing(command: string) {
  const typed = command.length * CHAR_MS
  return { typed, reveal: typed + TICK_MS * 2, done: typed + TICK_MS * 3 }
}

/** Registry components export their name in PascalCase: dna-carousel → DnaCarousel. */
function exportName(name: string) {
  return name.replace(/(^|-)(\w)/g, (_, __, c: string) => c.toUpperCase())
}

function at(ms: number) {
  return { "--mo-delay": `${ms}ms` } as React.CSSProperties
}

export function InstallStage({ items, namespace }: { items: StageItem[]; namespace: string }) {
  const [active, setActive] = React.useState(0)
  const [prev, setPrev] = React.useState<number | null>(null)
  const [run, setRun] = React.useState(0)
  const [auto, setAuto] = React.useState(true)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const tiltRef = React.useRef<HTMLDivElement>(null)
  const onScreen = React.useRef(true)

  const item = items[active]
  const command = `npx shadcn add ${namespace}/${item.name}`
  const t = timing(command)

  function show(index: number) {
    setPrev(active)
    setActive(index)
    setRun((r) => r + 1)
  }

  function pick(index: number) {
    setAuto(false)
    if (index !== active) show(index)
  }

  // Autoplay: the next piece once this one has finished and been held. Waits while off screen
  // or in a background tab, and never runs for people who prefer reduced motion.
  React.useEffect(() => {
    if (!auto || items.length < 2) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let timer = 0
    const next = () => {
      if (!onScreen.current || document.hidden) {
        timer = window.setTimeout(next, 600)
        return
      }
      setPrev(active)
      setActive((active + 1) % items.length)
      setRun((r) => r + 1)
    }
    timer = window.setTimeout(next, t.done + HOLD_MS)
    return () => window.clearTimeout(timer)
  }, [auto, active, run, items.length, t.done])

  React.useEffect(() => {
    const el = rootRef.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => (onScreen.current = entry.isIntersecting))
    io.observe(el)
    return () => io.disconnect()
  }, [])

  // The window leans a few degrees toward the pointer, eased so it trails the hand.
  React.useEffect(() => {
    const el = tiltRef.current
    if (!el) return
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    let raf = 0
    let x = 0
    let y = 0
    let tx = 0
    let ty = 0
    const step = () => {
      x += (tx - x) * 0.07
      y += (ty - y) * 0.07
      el.style.transform = `rotateX(${(-y * 3.5).toFixed(3)}deg) rotateY(${(x * 4.5).toFixed(3)}deg)`
      raf = Math.abs(tx - x) + Math.abs(ty - y) > 0.0005 ? requestAnimationFrame(step) : 0
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step)
    }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      tx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / (r.width / 2)))
      ty = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / window.innerHeight))
      kick()
    }
    const onLeave = () => {
      tx = 0
      ty = 0
      kick()
    }
    window.addEventListener("pointermove", onMove, { passive: true })
    document.documentElement.addEventListener("pointerleave", onLeave)
    return () => {
      window.removeEventListener("pointermove", onMove)
      document.documentElement.removeEventListener("pointerleave", onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={rootRef} className="w-full">
      <div className="[perspective:1800px]">
        <div className="mo-rise" style={at(320)}>
          <div
            ref={tiltRef}
            className="rounded-2xl border bg-card/80 p-1.5 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.35)] backdrop-blur will-change-transform dark:shadow-[0_40px_120px_-40px_rgb(0_0_0/0.9)]"
          >
            <div className="overflow-hidden rounded-[11px] border bg-background text-left">
              {/* Window chrome */}
              <div className="flex h-10 items-center gap-3 border-b px-4">
                <div className="flex gap-1.5" aria-hidden>
                  <span className="size-2.5 rounded-full bg-foreground/15" />
                  <span className="size-2.5 rounded-full bg-foreground/15" />
                  <span className="size-2.5 rounded-full bg-foreground/15" />
                </div>
                <p className="min-w-0 flex-1 truncate text-center font-mono text-[11px] text-muted-foreground">
                  localhost:3000/<span className="text-foreground">{item.name}</span>
                </p>
                <span className="w-[42px]" aria-hidden />
              </div>

              <div className="grid lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
                {/* Terminal: dark in both modes, like the one on your desk. */}
                <div className="order-2 flex min-h-56 flex-col bg-[#0a0a0a] p-5 font-mono text-[12px] leading-6 text-neutral-300 lg:order-1 lg:min-h-0 lg:border-r lg:border-white/10">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-[11px] text-neutral-500">Terminal</span>
                    <CopyButton
                      value={command}
                      label="Copy command"
                      className="-mr-2 size-6 text-neutral-500 hover:bg-white/10 hover:text-white"
                    />
                  </div>
                  <div key={run} aria-live="polite">
                    <p className="flex min-w-0 gap-2 whitespace-nowrap">
                      <span className="text-neutral-500" aria-hidden>
                        $
                      </span>
                      <span
                        className="mo-type inline-block text-white"
                        style={{ "--mo-type": `${t.typed}ms`, "--mo-chars": command.length } as React.CSSProperties}
                      >
                        {command}
                      </span>
                    </p>
                    <p className="mo-line" style={at(t.typed + TICK_MS)}>
                      <span className="text-emerald-400">✔</span> Checking registry.
                    </p>
                    <p className="mo-line" style={at(t.reveal)}>
                      <span className="text-emerald-400">✔</span> Created {item.fileCount}{" "}
                      {item.fileCount === 1 ? "file:" : "files."}
                    </p>
                    {item.fileCount === 1 && (
                      <p className="mo-line truncate pl-4 text-neutral-500" style={at(t.reveal)}>
                        - components/{item.name}.tsx
                      </p>
                    )}
                    <p className="mo-line flex items-center gap-1 text-neutral-500" style={at(t.done)}>
                      Done. Yours to edit.
                      <span className="hero-caret inline-block h-3.5 w-[7px] bg-neutral-300" aria-hidden />
                    </p>
                  </div>

                  {/* What you write next: the import, from your own components folder. */}
                  <div
                    key={`use-${run}`}
                    className="mo-line mt-auto hidden border-t border-white/10 pt-4 text-[11.5px] leading-5 lg:block"
                    style={at(t.done + TICK_MS)}
                  >
                    <p className="mb-2 text-[11px] text-neutral-500">app/page.tsx</p>
                    <p className="truncate">
                      <span className="text-violet-300">import</span> {"{ "}
                      <span className="text-sky-300">{exportName(item.name)}</span>
                      {" }"} <span className="text-violet-300">from</span>{" "}
                      <span className="text-emerald-300">&quot;@/components/{item.name}&quot;</span>
                    </p>
                    <p className="mt-3">
                      <span className="text-violet-300">export default function</span>{" "}
                      <span className="text-sky-300">Page</span>() {"{"}
                    </p>
                    <p className="truncate pl-4">
                      <span className="text-violet-300">return</span> {"<"}
                      <span className="text-sky-300">{exportName(item.name)}</span> {"/>"}
                    </p>
                    <p>{"}"}</p>
                  </div>
                </div>

                {/* Preview: the new piece develops over the last one. */}
                <div className="relative order-1 aspect-[16/10] overflow-hidden bg-muted lg:order-2">
                  <div
                    aria-hidden
                    className="absolute inset-0 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]"
                  />
                  {items.map((it, i) => {
                    const isActive = i === active
                    const isPrev = i === prev
                    return (
                      <Image
                        key={isActive ? `${it.name}-${run}` : it.name}
                        src={it.poster}
                        alt={isActive ? `${it.title} preview` : ""}
                        fill
                        priority={i === 0}
                        sizes="(min-width: 1024px) 600px, 100vw"
                        className={cn(
                          "object-cover",
                          isActive ? "mo-reveal z-20" : isPrev ? "z-10" : "opacity-0"
                        )}
                        style={isActive ? at(t.typed + TICK_MS) : undefined}
                      />
                    )
                  })}
                  <div
                    key={`scan-${run}`}
                    aria-hidden
                    className="mo-scan pointer-events-none absolute inset-0 z-30"
                    style={at(t.typed + TICK_MS)}
                  />
                  <Link
                    href={`/docs/${item.name}`}
                    className="group absolute bottom-3 left-3 z-40 inline-flex items-center gap-1.5 rounded-full border bg-background/85 py-1 pr-2.5 pl-3 text-xs font-medium backdrop-blur transition-colors hover:bg-background"
                  >
                    {item.title}
                    <HugeiconsIcon
                      icon={ArrowRight01Icon}
                      className="size-3.5 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
                      strokeWidth={2}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chips: pick a piece to install it. The active one fills while autoplay holds it. */}
      <div
        className="mo-enter no-scrollbar -mx-4 mt-6 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:justify-center sm:px-0"
        style={at(700)}
        role="group"
        aria-label="Install a piece"
      >
        {items.map((it, i) => (
          <button
            key={it.name}
            type="button"
            aria-pressed={i === active}
            onClick={() => pick(i)}
            className={cn(
              "relative isolate shrink-0 overflow-hidden rounded-full border px-3.5 py-1.5 text-xs font-medium whitespace-nowrap transition-[color,background-color,border-color,scale] duration-150 active:scale-[0.97]",
              i === active
                ? "border-foreground/20 bg-foreground/[0.04] text-foreground"
                : "text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            )}
          >
            {i === active && auto && (
              <span
                key={run}
                aria-hidden
                className="mo-progress absolute inset-0 -z-10 bg-foreground/[0.06]"
                style={{ "--mo-hold": `${t.done + HOLD_MS}ms` } as React.CSSProperties}
              />
            )}
            {it.title}
          </button>
        ))}
      </div>
    </div>
  )
}
