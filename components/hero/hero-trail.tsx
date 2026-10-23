"use client"

import * as React from "react"
import Image from "next/image"

/**
 * Cursor image trail. Every ~80px of pointer travel a small painting rises
 * under the cursor, tilts with the direction of travel, hangs for a moment and
 * drifts away. A fixed pool of cards is recycled, so the DOM never grows.
 * Touch devices and reduced motion render nothing visible. Areas marked with
 * `data-trail-quiet` (plus half a card of margin) never spawn cards.
 */

export const TRAIL_ART = [
  { src: "/art/bust-headphones.webp", alt: "Marble bust of a Roman woman wearing white headphones" },
  { src: "/art/hands-card.webp", alt: "Hands in red velvet presenting a blank marble card" },
  { src: "/art/muse-phone.webp", alt: "A woman in a white classical gown reading a smartphone" },
  { src: "/art/scholar-laptop.webp", alt: "A woman in a white gown typing on a halftone laptop" },
  { src: "/art/cherub-swatches.webp", alt: "A cherub holding a paintbrush and a fan of colour swatches" },
  { src: "/art/sorting-prints.webp", alt: "A woman sorting prints at a wooden desk" },
  { src: "/art/laureate-laptop.webp", alt: "A marble statue with a laurel wreath holding a black laptop" },
  { src: "/art/sculptor-chisel.webp", alt: "A sculptor's hands with chisel and mallet at a marble face" },
  { src: "/art/still-life-keyboard.webp", alt: "Still life with grapes, oranges, a pewter jug and a keyboard" },
  { src: "/art/owl-keyboard.webp", alt: "An owl perched on a cream mechanical keyboard" },
  { src: "/art/statue-tablet.webp", alt: "A marble youth drawing on a black tablet with a stylus" },
  { src: "/art/weaver-cable.webp", alt: "A woman at a spinning wheel spins thread into a white cable" },
  { src: "/art/printing-press.webp", alt: "A printmaker pulls a website wireframe from a wooden press" },
  { src: "/art/architect-compass.webp", alt: "An architect's hands with a brass compass over an inked interface grid" },
  { src: "/art/philosopher-mouse.webp", alt: "An old philosopher studies a white computer mouse in his palm" },
]

const POOL = 14
const STEP = 80
const LIFE = 1500

export function HeroTrail() {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const host = ref.current
    const stage = host?.parentElement
    if (!host || !stage) return
    if (!window.matchMedia("(pointer: fine)").matches) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const cards = Array.from(host.children) as HTMLElement[]
    let n = 0
    let lx = Number.NaN
    let ly = Number.NaN

    const inQuietZone = (cx: number, cy: number) => {
      const m = cards[0].offsetWidth / 2
      return Array.from(stage.querySelectorAll<HTMLElement>("[data-trail-quiet]")).some((zone) => {
        const q = zone.getBoundingClientRect()
        return cx > q.left - m && cx < q.right + m && cy > q.top - m && cy < q.bottom + m
      })
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return
      if (inQuietZone(e.clientX, e.clientY)) {
        lx = Number.NaN
        ly = Number.NaN
        return
      }
      const r = stage.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      if (Number.isNaN(lx)) {
        lx = x
        ly = y
        return
      }
      const dx = x - lx
      const dy = y - ly
      if (Math.hypot(dx, dy) < STEP) return
      lx = x
      ly = y

      const el = cards[n % cards.length]
      n += 1
      const tilt = Math.max(-16, Math.min(16, dx * 0.12))
      const lift = -40 - Math.min(40, Math.abs(dy) * 0.25)

      el.getAnimations().forEach((a) => a.cancel())
      el.style.left = `${x}px`
      el.style.top = `${y}px`
      el.style.zIndex = String(n)
      el.animate(
        [
          { transform: `translate(-50%, -50%) translateY(28px) rotate(${tilt}deg) scale(0.55)`, opacity: 0 },
          { transform: `translate(-50%, -50%) translateY(0) rotate(${tilt * 0.6}deg) scale(1)`, opacity: 1, offset: 0.16 },
          { transform: `translate(-50%, -50%) translateY(-14px) rotate(${tilt * 0.4}deg) scale(1)`, opacity: 1, offset: 0.62 },
          { transform: `translate(-50%, -50%) translateY(${lift}px) rotate(${-tilt * 0.25}deg) scale(0.9)`, opacity: 0 },
        ],
        { duration: LIFE, easing: "cubic-bezier(0.22, 1, 0.36, 1)", fill: "both" }
      )
    }
    const onLeave = () => {
      lx = Number.NaN
      ly = Number.NaN
    }

    stage.addEventListener("pointermove", onMove)
    stage.addEventListener("pointerleave", onLeave)
    return () => {
      stage.removeEventListener("pointermove", onMove)
      stage.removeEventListener("pointerleave", onLeave)
    }
  }, [])

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {Array.from({ length: POOL }, (_, i) => {
        const art = TRAIL_ART[i % TRAIL_ART.length]
        return (
          <div
            key={i}
            className="absolute aspect-[4/5] w-[clamp(110px,11vw,168px)] overflow-hidden rounded-[3px] opacity-0 shadow-[0_30px_50px_-18px_rgba(0,0,0,0.5)] ring-1 ring-black/10 will-change-transform dark:ring-white/10"
          >
            <Image src={art.src} alt="" fill sizes="168px" className="object-cover" />
          </div>
        )
      })}
    </div>
  )
}
