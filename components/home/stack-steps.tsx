"use client"

import * as React from "react"
import Image from "next/image"

import { cn } from "@/lib/utils"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"

export type Step = {
  n: string
  title: string
  body: string
  art: { src: string; alt: string }
  /** Optional UI layered on the painting. */
  widget?: React.ReactNode
}

/**
 * Sticky stacking cards. Each card pins near the top; as the next one slides over it,
 * the one underneath eases back and dims, like prints being laid on a table.
 */
export function StackSteps({ steps }: { steps: Step[] }) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const root = ref.current
    if (!root) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const wrappers = Array.from(root.querySelectorAll<HTMLElement>("[data-step]"))
    let raf = 0
    const update = () => {
      raf = 0
      const top = 96
      wrappers.forEach((w, i) => {
        if (i === wrappers.length - 1) return // the top card never shrinks
        const r = w.getBoundingClientRect()
        const stickyTop = top + i * 16
        const p = Math.min(1, Math.max(0, (stickyTop - r.top) / Math.max(1, r.height)))
        w.style.setProperty("--p", p.toFixed(4))
      })
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={ref} className="flex flex-col gap-6">
      {steps.map((s, i) => (
        <div
          key={s.n}
          data-step
          className="md:sticky"
          style={{ top: 96 + i * 16, "--p": 0 } as React.CSSProperties}
        >
          <article
            className={cn(
              "relative grid overflow-hidden rounded-2xl bg-card text-card-foreground ring-1 ring-border md:grid-cols-[0.9fr_1.1fr]",
              "md:[scale:calc(1-var(--p)*0.05)] md:[transform-origin:top_center]"
            )}
          >
            {/* Dims the card as the next one slides over it, without making it see-through. */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-10 hidden bg-background md:block md:[opacity:calc(var(--p)*0.55)]"
            />
            <div className="relative isolate aspect-[4/3] overflow-hidden md:aspect-auto md:min-h-[420px]">
              <Image
                src={s.art.src}
                alt={s.art.alt}
                fill
                sizes="(min-width: 768px) 480px, 100vw"
                className="-z-10 object-cover"
              />
              <GrainOverlay opacity={0.16} />
              {s.widget && <div className="absolute inset-0 grid place-items-center p-6">{s.widget}</div>}
            </div>
            <div className="flex flex-col justify-between gap-10 p-7 sm:p-10">
              <p className="font-mono text-[11px] tracking-[.08em] text-muted-foreground">{s.n} —</p>
              <div>
                <h3 className="font-serif text-4xl leading-[0.95] tracking-[-0.02em] text-balance sm:text-5xl lg:text-6xl">
                  {s.title}
                </h3>
                <p className="mt-5 max-w-[44ch] leading-relaxed text-pretty text-muted-foreground">{s.body}</p>
              </div>
            </div>
          </article>
        </div>
      ))}
    </div>
  )
}
