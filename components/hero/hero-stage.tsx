"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/**
 * The hero's outer section. Drives the restoration lens and the depth parallax
 * through CSS variables on the section:
 *
 *   --mx / --my  lens centre in px (eased)
 *   --px / --py  pointer offset from centre, -0.5..0.5 (eased), for parallax
 *
 * With no pointer over the stage the lens drifts across the painting on its own,
 * so the hero is alive before anyone touches it. A fine pointer takes over the
 * lens on entry and hands it back on leave. Reduced motion pins the lens.
 */
export function HeroStage({ className, children, ...props }: React.ComponentProps<"section">) {
  const ref = React.useRef<HTMLElement>(null)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    const fine = window.matchMedia("(pointer: fine)").matches
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    const target = { x: 0, y: 0, mx: 0, my: 0 }
    const current = { x: 0, y: 0, mx: 0, my: 0 }
    let raf = 0
    let visible = true
    let pointer = false
    const t0 = performance.now()

    const write = () => {
      el.style.setProperty("--px", current.x.toFixed(4))
      el.style.setProperty("--py", current.y.toFixed(4))
      el.style.setProperty("--mx", `${current.mx.toFixed(1)}px`)
      el.style.setProperty("--my", `${current.my.toFixed(1)}px`)
    }

    // Idle path: a slow Lissajous sweep over the lower two thirds, where the painting is.
    const idle = (now: number) => {
      const s = (now - t0) / 1000
      target.mx = el.clientWidth * (0.5 + 0.27 * Math.sin(s * 0.19))
      target.my = el.clientHeight * (0.62 + 0.11 * Math.sin(s * 0.31 + 1.3))
    }

    const tick = (now: number) => {
      const scanning = !pointer && !reduce
      if (scanning) idle(now)
      let settled = true
      for (const k of ["x", "y", "mx", "my"] as const) {
        const unit = k === "x" || k === "y"
        const d = target[k] - current[k]
        if (Math.abs(d) > (unit ? 0.0004 : 0.15)) settled = false
        current[k] += d * (unit ? 0.07 : scanning ? 0.05 : 0.18)
      }
      write()
      raf = visible && (scanning || !settled) ? requestAnimationFrame(tick) : 0
    }
    const kick = () => {
      if (!raf && visible) raf = requestAnimationFrame(tick)
    }

    // Start the lens on the painting, not in a corner.
    idle(t0)
    current.mx = target.mx
    current.my = target.my
    write()

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return
      const r = el.getBoundingClientRect()
      target.mx = e.clientX - r.left
      target.my = e.clientY - r.top
      if (!reduce) {
        target.x = target.mx / r.width - 0.5
        target.y = target.my / r.height - 0.5
      }
      if (!pointer) {
        pointer = true
        el.dataset.pointer = "in"
      }
      kick()
    }
    const onLeave = () => {
      pointer = false
      el.dataset.pointer = "out"
      el.dataset.press = "out"
      target.x = 0
      target.y = 0
      kick()
    }
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return
      el.dataset.press = "in"
    }
    const onUp = () => {
      el.dataset.press = "out"
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) kick()
    })
    io.observe(el)

    if (fine) {
      el.addEventListener("pointermove", onMove)
      el.addEventListener("pointerleave", onLeave)
      el.addEventListener("pointerdown", onDown)
      window.addEventListener("pointerup", onUp)
    }
    kick()

    return () => {
      io.disconnect()
      el.removeEventListener("pointermove", onMove)
      el.removeEventListener("pointerleave", onLeave)
      el.removeEventListener("pointerdown", onDown)
      window.removeEventListener("pointerup", onUp)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section
      ref={ref}
      data-pointer="out"
      data-press="out"
      className={cn("relative isolate overflow-hidden", className)}
      {...props}
    >
      {children}
    </section>
  )
}
