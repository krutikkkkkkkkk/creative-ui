"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The hero's outer section. Exposes the pointer's offset from centre as
 * `--px` / `--py` (-0.5..0.5, eased) so layers with `.hero-depth` can drift
 * at different depths. Touch devices and reduced motion get a still stage.
 */
export function HeroStage({ className, children, ...props }: React.ComponentProps<"section">) {
  const ref = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el || !window.matchMedia("(pointer: fine)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const target = { x: 0, y: 0 }
    const current = { x: 0, y: 0 }
    let raf = 0

    const tick = () => {
      let settled = true
      for (const k of ["x", "y"] as const) {
        const d = target[k] - current[k]
        if (Math.abs(d) > 0.0004) settled = false
        current[k] += d * 0.07
      }
      el.style.setProperty("--px", current.x.toFixed(4))
      el.style.setProperty("--py", current.y.toFixed(4))
      raf = settled ? 0 : requestAnimationFrame(tick)
    }
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick)
    }
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect()
      target.x = (e.clientX - r.left) / r.width - 0.5
      target.y = (e.clientY - r.top) / r.height - 0.5
      el.dataset.pointer = "in"
      kick()
    }
    const onLeave = () => {
      el.dataset.pointer = "out"
      target.x = 0
      target.y = 0
      kick()
    }

    el.addEventListener("pointermove", onMove)
    el.addEventListener("pointerleave", onLeave)
    return () => {
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerleave", onLeave)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section ref={ref} data-pointer="out" className={cn("relative isolate overflow-hidden", className)} {...props}>
      {children}
    </section>
  )
}
