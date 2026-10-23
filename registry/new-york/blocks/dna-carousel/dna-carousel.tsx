"use client"

import * as React from "react"

export type DnaCarouselImage = { src: string; alt?: string }

export interface DnaCarouselProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  images: DnaCarouselImage[]

  /* Layout */
  /** Card width in px (before responsive fitting). */
  itemWidth?: number
  /** Card height in px (before responsive fitting). */
  itemHeight?: number
  /** Extra space between neighbouring cards along the helix axis, in px. */
  gap?: number
  /** Card corner radius in px. */
  radius?: number

  /* 3D motion */
  /** How far the back strand sits behind the front strand, in px. */
  depth?: number
  /** Extra helix twist per card, in degrees. 0 gives a flat zig-zag. */
  curve?: number
  /** Vertical distance between the two strands, in px. */
  spread?: number
  /** CSS perspective distance in px. Lower is more dramatic. */
  perspective?: number
  /** Y-axis rotation applied per card away from the centre, in degrees. */
  rotation?: number
  /** Tilt of the whole helix axis, in degrees. */
  tilt?: number

  /* Image effects */
  activeScale?: number
  inactiveScale?: number
  /** Blur in px per card of distance from the centre. */
  blur?: number
  /** Chromatic-aberration offset in px. Also grows with scroll speed. */
  rgbSplit?: number
  inactiveOpacity?: number
  shadow?: boolean
  /** Shadow opacity, 0 to 1. */
  shadowStrength?: number

  /* Interaction */
  dragSensitivity?: number
  /** Momentum kept per frame after a flick, 0 to 1. Higher coasts longer. */
  inertia?: number
  /** How quickly cards settle into place, 0 to 1. */
  snapStrength?: number
  autoplay?: boolean
  /** Autoplay speed in cards per second. Negative values run backwards. */
  autoplaySpeed?: number
  pauseOnHover?: boolean
  /** Scroll the carousel with the mouse wheel or trackpad while hovering it. */
  wheel?: boolean
  grabCursor?: boolean
  /** How many cards stay visible on each side of the active one. */
  visibleItems?: number

  /** Called with the index (into `images`) of the card that becomes active. */
  onIndexChange?: (index: number) => void
}

const DEFAULTS = {
  itemWidth: 220,
  itemHeight: 300,
  gap: 20,
  radius: 14,
  depth: 260,
  curve: 24,
  spread: 70,
  perspective: 1100,
  rotation: 22,
  tilt: -6,
  activeScale: 1,
  inactiveScale: 0.8,
  blur: 1.5,
  rgbSplit: 0,
  inactiveOpacity: 0.8,
  shadow: true,
  shadowStrength: 0.35,
  dragSensitivity: 1,
  inertia: 0.93,
  snapStrength: 0.08,
  autoplay: true,
  autoplaySpeed: 0.15,
  pauseOnHover: true,
  wheel: true,
  grabCursor: true,
  visibleItems: 4,
}

type Settings = typeof DEFAULTS
type Config = Settings & { fit: number; reduced: boolean }
type Mode = "idle" | "drag" | "coast" | "snap" | "auto"

const RESUME_DELAY = 2500

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const mod = (a: number, n: number) => ((a % n) + n) % n
const smoothstep = (e0: number, e1: number, x: number) => {
  const t = clamp((x - e0) / (e1 - e0), 0, 1)
  return t * t * (3 - 2 * t)
}
/** Signed distance from `pos` to `slot` on a loop of `n` slots, in [-n/2, n/2). */
const loopOffset = (slot: number, pos: number, n: number) => mod(slot - pos + n / 2, n) - n / 2

/** Distance between neighbouring cards along the helix axis, before fitting. */
const stepOf = (c: Settings) => c.itemWidth / 2 + c.gap

/**
 * Places one card on the helix. `p` is its signed distance from the centre in cards.
 * The twist is a half turn per card plus `curve`, so neighbours always sit on opposite
 * strands and whichever card reaches the centre comes to the front.
 */
function placeCard(p: number, velocity: number, c: Config): React.CSSProperties {
  const a = Math.abs(p)
  const f = c.fit
  const theta = p * (Math.PI + (c.curve * Math.PI) / 180)

  const u = p * stepOf(c)
  const v = Math.sin(theta) * c.spread
  const z = ((Math.cos(theta) - 1) / 2) * c.depth - a * c.depth * 0.08

  const t = (c.tilt * Math.PI) / 180
  const x = u * Math.cos(t) - v * Math.sin(t)
  const y = u * Math.sin(t) + v * Math.cos(t)

  const active = Math.max(0, 1 - a)
  const scale = c.inactiveScale + (c.activeScale - c.inactiveScale) * active
  const rotY = clamp(-p * c.rotation, -80, 80)
  const fade = 1 - smoothstep(c.visibleItems - 0.5, c.visibleItems + 0.5, a)

  const filters: string[] = []
  if (!c.reduced) {
    const blur = c.blur * Math.min(a, 3)
    if (blur > 0.05) filters.push(`blur(${blur.toFixed(2)}px)`)
    const split = c.rgbSplit * (Math.min(a, 1.5) + Math.min(Math.abs(velocity), 8) * 0.25)
    if (split > 0.1) {
      const s = split.toFixed(2)
      filters.push(
        `drop-shadow(${s}px 0 0 rgba(255,0,80,0.55))`,
        `drop-shadow(-${s}px 0 0 rgba(0,190,255,0.55))`
      )
    }
  }

  return {
    transform: `translate3d(${(x * f).toFixed(2)}px, ${(y * f).toFixed(2)}px, ${(z * f).toFixed(2)}px) rotateZ(${c.tilt}deg) rotateY(${rotY.toFixed(2)}deg) scale(${(scale * f).toFixed(4)})`,
    opacity: (c.inactiveOpacity + (1 - c.inactiveOpacity) * active) * fade,
    filter: filters.length ? filters.join(" ") : "none",
    boxShadow: c.shadow
      ? `0 24px 48px -12px rgba(0,0,0,${(c.shadowStrength * (0.4 + 0.6 * active)).toFixed(3)})`
      : "none",
    zIndex: Math.round(5000 + z * 4 - a * 2),
    visibility: fade <= 0 ? "hidden" : "visible",
  }
}

/** Repeats the images so the loop is long enough to fill both sides of the helix. */
function buildSlots(count: number, visibleItems: number) {
  if (count === 0) return []
  const min = Math.ceil(visibleItems) * 2 + 2
  let total = count
  while (total < min) total += count
  return Array.from({ length: total }, (_, i) => i % count)
}

function splitProps(props: Record<string, unknown>) {
  const settings: Record<string, unknown> = { ...DEFAULTS }
  const rest: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(props)) {
    if (key in DEFAULTS) {
      if (value !== undefined) settings[key] = value
    } else rest[key] = value
  }
  return { settings: settings as Settings, rest: rest as React.HTMLAttributes<HTMLDivElement> }
}

export function DnaCarousel({
  images,
  onIndexChange,
  className,
  style,
  "aria-label": ariaLabel = "Image carousel",
  ...props
}: DnaCarouselProps) {
  const { settings: s, rest } = splitProps(props)

  const slots = React.useMemo(
    () => buildSlots(images.length, s.visibleItems),
    [images.length, s.visibleItems]
  )

  const rootRef = React.useRef<HTMLDivElement>(null)
  const liveRef = React.useRef<HTMLDivElement>(null)
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const settingsRef = React.useRef(s)
  const slotsRef = React.useRef(slots)
  const imagesRef = React.useRef(images)
  const onIndexChangeRef = React.useRef(onIndexChange)
  const state = React.useRef({
    pos: 0,
    vel: 0,
    target: 0,
    mode: "idle" as Mode,
    resumeAt: 0,
    dirty: true,
    hovering: false,
    visible: true,
    reduced: false,
    fit: 1,
    lastIndex: -1,
  })
  const drag = React.useRef<{
    id: number
    startX: number
    startPos: number
    moved: boolean
    slot: number | null
    samples: { t: number; pos: number }[]
  } | null>(null)

  React.useEffect(() => {
    settingsRef.current = s
    slotsRef.current = slots
    imagesRef.current = images
    onIndexChangeRef.current = onIndexChange
    state.current.dirty = true
  })

  const settle = React.useCallback((target: number) => {
    const st = state.current
    st.target = target
    st.mode = "snap"
    st.resumeAt = performance.now() + RESUME_DELAY
  }, [])

  const goToSlot = (slot: number) => {
    const st = state.current
    settle(Math.round(st.pos + loopOffset(slot, st.pos, slotsRef.current.length)))
  }

  const stepBy = (delta: number) => {
    const st = state.current
    const base = st.mode === "snap" ? st.target : Math.round(st.pos)
    settle(base + delta)
  }

  // Reduced motion: no autoplay, blur or colour split, and a quicker settle.
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => {
      state.current.reduced = mq.matches
      state.current.dirty = true
    }
    update()
    mq.addEventListener("change", update)
    return () => mq.removeEventListener("change", update)
  }, [])

  // Scale the whole helix down to fit small containers.
  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const c = settingsRef.current
      const fit = Math.min(width / (c.itemWidth * 3), height / (c.itemHeight + c.spread * 2 + 60))
      state.current.fit = clamp(fit, 0.35, 1)
      state.current.dirty = true
    })
    ro.observe(root)
    return () => ro.disconnect()
  }, [])

  // Skip work while off screen.
  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const io = new IntersectionObserver(([entry]) => {
      state.current.visible = entry.isIntersecting
    })
    io.observe(root)
    return () => io.disconnect()
  }, [])

  // Wheel and trackpad. Needs a non-passive listener to stop the page scrolling.
  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const onWheel = (e: WheelEvent) => {
      const c = settingsRef.current
      if (!c.wheel || !slotsRef.current.length) return
      const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY
      if (!raw) return
      e.preventDefault()
      const delta = raw * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 400 : 1)
      const st = state.current
      if (st.mode !== "coast" && st.mode !== "auto") st.vel = 0
      st.vel = clamp(st.vel + (delta / stepOf(c)) * 6 * c.dragSensitivity, -25, 25)
      st.mode = "coast"
      st.resumeAt = performance.now() + RESUME_DELAY
    }
    root.addEventListener("wheel", onWheel, { passive: false })
    return () => root.removeEventListener("wheel", onWheel)
  }, [])

  // Animation loop. Writes styles straight to the DOM so React never re-renders per frame.
  React.useEffect(() => {
    let raf = 0
    let last = performance.now()

    const canAutoplay = (c: Config, now: number) =>
      c.autoplay &&
      c.autoplaySpeed !== 0 &&
      !c.reduced &&
      now >= state.current.resumeAt &&
      !(c.pauseOnHover && state.current.hovering)

    const render = (c: Config) => {
      const st = state.current
      const n = slotsRef.current.length
      const root = rootRef.current
      if (root) root.style.perspective = `${c.perspective * c.fit}px`
      for (let i = 0; i < n; i++) {
        const el = itemRefs.current[i]
        if (el) Object.assign(el.style, placeCard(loopOffset(i, st.pos, n), st.vel, c))
      }

      const activeSlot = mod(Math.round(st.pos), n)
      if (activeSlot !== st.lastIndex) {
        itemRefs.current[st.lastIndex]?.setAttribute("aria-hidden", "true")
        itemRefs.current[activeSlot]?.setAttribute("aria-hidden", "false")
        st.lastIndex = activeSlot
        const index = slotsRef.current[activeSlot]
        onIndexChangeRef.current?.(index)
        if (st.mode !== "auto" && liveRef.current) {
          const img = imagesRef.current[index]
          liveRef.current.textContent = `${img?.alt || "Image"}, ${index + 1} of ${imagesRef.current.length}`
        }
      }
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const st = state.current
      if (!st.visible || !slotsRef.current.length || dt <= 0) return
      const c: Config = { ...settingsRef.current, fit: st.fit, reduced: st.reduced }
      const prev = st.pos

      switch (st.mode) {
        case "coast": {
          st.pos += st.vel * dt
          st.vel *= Math.pow(clamp(c.inertia, 0, 0.999), dt * 60)
          if (Math.abs(st.vel) < 1.2) {
            st.target = Math.round(st.pos + st.vel * 0.12)
            st.mode = "snap"
          }
          break
        }
        case "snap": {
          const k = c.reduced ? 0.4 : clamp(c.snapStrength, 0.01, 1)
          st.pos += (st.target - st.pos) * (1 - Math.pow(1 - k, dt * 60))
          st.vel = (st.pos - prev) / dt
          if (Math.abs(st.target - st.pos) < 0.0005) {
            st.pos = st.target
            st.vel = 0
            st.mode = "idle"
            st.dirty = true
          }
          break
        }
        case "auto": {
          if (canAutoplay(c, now)) {
            st.pos += c.autoplaySpeed * dt
            st.vel = c.autoplaySpeed
          } else {
            st.target = c.autoplaySpeed > 0 ? Math.ceil(st.pos) : Math.floor(st.pos)
            st.mode = "snap"
          }
          break
        }
        case "idle": {
          if (canAutoplay(c, now)) st.mode = "auto"
          break
        }
      }

      if (st.pos !== prev || st.dirty || st.mode === "drag") {
        st.dirty = false
        render(c)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0 || !slots.length) return
    const st = state.current
    const slotAttr = (e.target as HTMLElement).closest<HTMLElement>("[data-slot]")?.dataset.slot
    e.currentTarget.setPointerCapture(e.pointerId)
    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startPos: st.pos,
      moved: false,
      slot: slotAttr != null ? Number(slotAttr) : null,
      samples: [{ t: performance.now(), pos: st.pos }],
    }
    st.mode = "drag"
    st.vel = 0
    st.resumeAt = Infinity
    if (s.grabCursor) e.currentTarget.style.cursor = "grabbing"
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const dx = e.clientX - d.startX
    if (!d.moved && Math.abs(dx) > 4) d.moved = true
    const st = state.current
    st.pos = d.startPos - (dx / (stepOf(s) * st.fit)) * s.dragSensitivity
    const now = performance.now()
    d.samples.push({ t: now, pos: st.pos })
    while (d.samples.length > 2 && now - d.samples[0].t > 100) d.samples.shift()
    const first = d.samples[0]
    st.vel = now > first.t ? ((st.pos - first.pos) / (now - first.t)) * 1000 : 0
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    if (s.grabCursor) e.currentTarget.style.cursor = "grab"
    const st = state.current
    st.resumeAt = performance.now() + RESUME_DELAY
    if (!d.moved && !cancelled && d.slot != null) {
      goToSlot(d.slot)
      return
    }
    const stale = performance.now() - d.samples[d.samples.length - 1].t > 80
    st.vel = stale ? 0 : clamp(st.vel, -30, 30)
    st.mode = "coast"
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") stepBy(1)
    else if (e.key === "ArrowLeft") stepBy(-1)
    else return
    e.preventDefault()
  }

  const initial: Config = { ...s, fit: 1, reduced: false }

  return (
    <div
      {...rest}
      ref={rootRef}
      role="region"
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      tabIndex={0}
      className={[
        "relative overflow-hidden select-none outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        perspective: `${s.perspective}px`,
        touchAction: "pan-y",
        cursor: s.grabCursor ? "grab" : undefined,
        ...style,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={(e) => endDrag(e, false)}
      onPointerCancel={(e) => endDrag(e, true)}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") state.current.hovering = true
      }}
      onPointerLeave={(e) => {
        if (e.pointerType === "mouse") state.current.hovering = false
      }}
      onKeyDown={onKeyDown}
    >
      {slots.map((imageIndex, i) => {
        const image = images[imageIndex]
        const p = loopOffset(i, 0, slots.length)
        return (
          <div
            key={i}
            ref={(el) => {
              itemRefs.current[i] = el
            }}
            data-slot={i}
            aria-hidden={Math.round(p) !== 0}
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: s.itemWidth,
              height: s.itemHeight,
              marginLeft: -s.itemWidth / 2,
              marginTop: -s.itemHeight / 2,
              borderRadius: s.radius,
              overflow: "hidden",
              backfaceVisibility: "hidden",
              willChange: "transform, opacity, filter",
              background: "var(--muted, #111)",
              ...placeCard(p, 0, initial),
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt={image.alt ?? ""}
              draggable={false}
              loading={Math.abs(p) <= s.visibleItems ? "eager" : "lazy"}
              decoding="async"
              className="pointer-events-none block size-full object-cover select-none"
            />
          </div>
        )
      })}
      <div ref={liveRef} aria-live="polite" aria-atomic="true" className="sr-only" />
    </div>
  )
}
