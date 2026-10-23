"use client"

import * as React from "react"

/** A number that counts up from 0 when it scrolls into view. Strings render as-is. */
export function CountUp({ value, duration = 1200 }: { value: number | string; duration?: number }) {
  const ref = React.useRef<HTMLSpanElement>(null)
  // Server-rendered with the real value, so the number is right without JS; the
  // client resets to 0 before paint and counts up once the element is half visible.
  const [n, setN] = React.useState<number | null>(typeof value === "number" ? value : null)

  React.useLayoutEffect(() => {
    if (typeof value !== "number") return
    const el = ref.current
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    setN(0)
    let raf = 0
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        const start = performance.now()
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / duration)
          const eased = 1 - Math.pow(1 - t, 4)
          setN(Math.round(value * eased))
          if (t < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.5 }
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [value, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {typeof value === "number" ? (n ?? value).toLocaleString() : value}
    </span>
  )
}
