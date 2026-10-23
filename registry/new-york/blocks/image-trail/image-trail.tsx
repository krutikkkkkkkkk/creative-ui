"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export interface TrailImage {
  src: string
  /** Not announced: the trail is decorative and hidden from assistive tech. */
  alt?: string
}

export interface ImageTrailProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Images to drop along the pointer path, used in order and looped. */
  images: readonly TrailImage[]
  /** Pointer travel in px between two cards. Smaller is denser. Default 80. */
  spacing?: number
  /** Life of one card in ms: rise, hang, drift away. Default 1500. */
  duration?: number
  /** Most cards on screen at once. Cards are recycled, so the DOM never grows. Default 14. */
  maxCards?: number
  /** Largest tilt in degrees, following the direction of travel. `0` keeps cards upright. Default 16. */
  tilt?: number
  /** Selector for areas that never spawn cards, such as headlines and buttons. Default `[data-trail-quiet]`. */
  quietSelector?: string
  /** Classes for every card: size, aspect ratio, radius, shadow. */
  cardClassName?: string
}

const EASE_OUT = "cubic-bezier(0.22, 1, 0.36, 1)"

/**
 * Cursor image trail. Every `spacing` px of pointer travel a card rises under
 * the cursor, tilts with the direction of travel, hangs for a moment and drifts
 * away. Drop it inside any positioned element; it listens on its parent.
 * Mouse and pen only, so touch scrolling stays clean. With reduced motion the
 * cards fade in place without moving.
 */
export function ImageTrail({
  images,
  spacing = 80,
  duration = 1500,
  maxCards = 14,
  tilt = 16,
  quietSelector = "[data-trail-quiet]",
  cardClassName,
  className,
  ...props
}: ImageTrailProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  // Read the latest images at spawn time without re-binding listeners.
  const imagesRef = React.useRef(images)
  React.useEffect(() => {
    imagesRef.current = images
  })

  const count = Math.max(1, Math.round(maxCards))

  React.useEffect(() => {
    const host = ref.current
    const stage = host?.parentElement
    if (!host || !stage) return

    const cards = Array.from(host.children) as HTMLElement[]
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    let n = 0
    let lx = Number.NaN
    let ly = Number.NaN
    const warm = new Set<string>()

    // Nothing loads until it can be used: warm the images once the page is idle,
    // and only where a mouse or pen exists. Touch-only devices never fetch them.
    const preload = () => {
      imagesRef.current.forEach(({ src }) => {
        if (warm.has(src)) return
        warm.add(src)
        const img = new Image()
        img.decoding = "async"
        img.src = src
      })
    }
    const idle = window.matchMedia("(any-pointer: fine)").matches
      ? window.setTimeout(() => {
          if (typeof window.requestIdleCallback === "function") window.requestIdleCallback(preload, { timeout: 2000 })
          else preload()
        }, 1000)
      : undefined

    const inQuietZone = (cx: number, cy: number) => {
      const m = cards[0].offsetWidth / 2
      return Array.from(stage.querySelectorAll<HTMLElement>(quietSelector)).some((zone) => {
        const q = zone.getBoundingClientRect()
        return cx > q.left - m && cx < q.right + m && cy > q.top - m && cy < q.bottom + m
      })
    }

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" && e.pointerType !== "pen") return
      const list = imagesRef.current
      if (!list.length) return

      const r = host.getBoundingClientRect()
      const x = e.clientX - r.left
      const y = e.clientY - r.top
      if (Number.isNaN(lx)) {
        preload()
        lx = x
        ly = y
        return
      }
      const dx = x - lx
      const dy = y - ly
      if (Math.hypot(dx, dy) < spacing) return
      if (inQuietZone(e.clientX, e.clientY)) {
        lx = Number.NaN
        ly = Number.NaN
        return
      }
      lx = x
      ly = y

      const el = cards[n % cards.length]
      const img = el.firstElementChild as HTMLImageElement
      const src = list[n % list.length].src
      if (img.getAttribute("src") !== src) img.src = src
      n += 1

      el.getAnimations().forEach((a) => a.cancel())
      el.style.zIndex = String(n)
      const at = `translate(${x}px, ${y}px) translate(-50%, -50%)`

      if (reduce.matches) {
        el.animate(
          [
            { transform: at, opacity: 0 },
            { transform: at, opacity: 1, offset: 0.2 },
            { transform: at, opacity: 0 },
          ],
          { duration, easing: "ease", fill: "both" }
        )
        return
      }

      const t = Math.max(-tilt, Math.min(tilt, dx * 0.12))
      const lift = -40 - Math.min(40, Math.abs(dy) * 0.25)
      el.animate(
        [
          { transform: `${at} translateY(28px) rotate(${t}deg) scale(0.55)`, opacity: 0 },
          { transform: `${at} rotate(${t * 0.6}deg)`, opacity: 1, offset: 0.16 },
          { transform: `${at} translateY(-14px) rotate(${t * 0.4}deg)`, opacity: 1, offset: 0.62 },
          { transform: `${at} translateY(${lift}px) rotate(${-t * 0.25}deg) scale(0.9)`, opacity: 0 },
        ],
        { duration, easing: EASE_OUT, fill: "both" }
      )
    }
    const onLeave = () => {
      lx = Number.NaN
      ly = Number.NaN
    }

    stage.addEventListener("pointermove", onMove, { passive: true })
    stage.addEventListener("pointerleave", onLeave)
    return () => {
      stage.removeEventListener("pointermove", onMove)
      stage.removeEventListener("pointerleave", onLeave)
      window.clearTimeout(idle)
      cards.forEach((el) => el.getAnimations().forEach((a) => a.cancel()))
    }
  }, [spacing, duration, tilt, quietSelector, count])

  return (
    <div
      ref={ref}
      aria-hidden
      data-slot="image-trail"
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      {...props}
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={cn(
            "absolute top-0 left-0 aspect-[4/5] w-[clamp(110px,11vw,168px)] overflow-hidden rounded-[3px] opacity-0 shadow-[0_30px_50px_-18px_rgba(0,0,0,0.5)] ring-1 ring-black/10 dark:ring-white/10",
            cardClassName
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt=""
            draggable={false}
            decoding="async"
            className="size-full object-cover"
          />
        </div>
      ))}
    </div>
  )
}
