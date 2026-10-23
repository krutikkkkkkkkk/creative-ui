"use client"

import * as React from "react"

export type RotundaCarouselItem = {
  src: string
  alt?: string
  /** Inferred from the file extension when omitted. Videos play muted and looped. */
  type?: "image" | "video"
  /** Poster frame for videos. */
  poster?: string
  /** Turns the tile into a link. */
  href?: string
  target?: "_self" | "_blank"
}

export interface RotundaCarouselProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "children"> {
  items: RotundaCarouselItem[]

  /* Layout */
  /** Ring radius in px (before responsive fitting), measured to tile centres. */
  radius?: number
  /** Tile size at the focus angle, in px. */
  maxSize?: number
  /** Tile size opposite the focus angle, in px. */
  minSize?: number
  /** How sharply tiles shrink away from the focus angle. 1 is a smooth cosine; higher keeps only the focus tile large. */
  taper?: number
  /** Where the largest tile sits, in degrees clockwise from 12 o'clock. */
  focusAngle?: number
  /** Opacity of the smallest tiles, 0 to 1. */
  minOpacity?: number
  /** Tile corner radius in px, at the largest size. */
  cornerRadius?: number
  objectFit?: "cover" | "contain"
  /** "upright" keeps tiles level; "radial" turns them with the ring. */
  orientation?: "upright" | "radial"
  shadow?: boolean
  /** Repeats `items` until the ring has at least this many tiles. */
  minItems?: number

  /* Motion */
  autoSpin?: boolean
  /** Auto-spin speed in degrees per second. */
  speed?: number
  direction?: "clockwise" | "counterclockwise"
  /** Ease the spin to a stop while the pointer is over the ring. */
  pauseOnHover?: boolean
  /** Scale applied to the tile under the pointer or keyboard focus. */
  hoverScale?: number
  /** Momentum kept per frame after a flick, 0 to 1. Higher coasts longer. */
  glide?: number
  /** Lag between the pointer and the ring while dragging, 0 to 0.95. */
  smoothing?: number

  /* Interaction */
  draggable?: boolean
  dragSensitivity?: number
  /** Spin the ring with the mouse wheel or trackpad while hovering it. */
  wheel?: boolean
  grabCursor?: boolean
}

const DEFAULTS = {
  radius: 240,
  maxSize: 150,
  minSize: 56,
  taper: 1.4,
  focusAngle: 180,
  minOpacity: 0.55,
  cornerRadius: 16,
  objectFit: "cover" as "cover" | "contain",
  orientation: "upright" as "upright" | "radial",
  shadow: true,
  minItems: 8,
  autoSpin: true,
  speed: 10,
  direction: "clockwise" as "clockwise" | "counterclockwise",
  pauseOnHover: true,
  hoverScale: 1.18,
  glide: 0.95,
  smoothing: 0.25,
  draggable: true,
  dragSensitivity: 1,
  wheel: true,
  grabCursor: true,
}

type Settings = typeof DEFAULTS
type Config = Settings & { fit: number; reduced: boolean }
type Mode = "free" | "drag" | "seek"

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v))
const mod = (a: number, n: number) => ((a % n) + n) % n
/** Signed shortest turn from `b` to `a`, in [-180, 180). */
const angleDiff = (a: number, b: number) => mod(a - b + 180, 360) - 180
const toRad = (deg: number) => (deg * Math.PI) / 180

const isVideo = (item: RotundaCarouselItem) =>
  item.type ? item.type === "video" : /\.(mp4|webm|mov|m4v)(\?|#|$)/i.test(item.src)

/** How close a tile at `theta` is to the focus angle, 1 at the focus and 0 opposite it. */
const weightAt = (theta: number, c: Settings) => {
  const d = toRad(angleDiff(theta, c.focusAngle))
  return Math.pow((1 + Math.cos(d)) / 2, Math.max(0.1, c.taper))
}

/** Places one tile on the ring. `hover` is its eased hover amount, 0 to 1. */
function placeTile(theta: number, hover: number, c: Config): React.CSSProperties {
  const f = c.fit
  const w = weightAt(theta, c)
  const size = c.minSize + (c.maxSize - c.minSize) * w
  const scale = (size / c.maxSize) * (1 + (c.hoverScale - 1) * hover) * f
  const x = Math.sin(toRad(theta)) * c.radius * f
  const y = -Math.cos(toRad(theta)) * c.radius * f
  const spin = c.orientation === "radial" ? theta : 0

  return {
    transform: `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${spin.toFixed(2)}deg) scale(${scale.toFixed(4)})`,
    opacity: Math.max(c.minOpacity + (1 - c.minOpacity) * w, hover),
    boxShadow: c.shadow
      ? `0 ${(18 * w + 4).toFixed(1)}px ${(40 * w + 10).toFixed(1)}px -12px rgba(0,0,0,${(0.18 + 0.27 * Math.max(w, hover)).toFixed(3)})`
      : "none",
    zIndex: Math.round(w * 1000) + (hover > 0.01 ? 2000 : 0),
  }
}

/** Repeats the items in whole passes so neighbours never show the same item twice in a row. */
function buildSlots(count: number, minItems: number) {
  if (count === 0) return []
  const total = count * Math.max(1, Math.ceil(minItems / count))
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

export function RotundaCarousel({
  items,
  className,
  style,
  "aria-label": ariaLabel = "Image carousel",
  ...props
}: RotundaCarouselProps) {
  const { settings: s, rest } = splitProps(props)

  const slots = React.useMemo(() => buildSlots(items.length, s.minItems), [items.length, s.minItems])

  const rootRef = React.useRef<HTMLDivElement>(null)
  const itemRefs = React.useRef<(HTMLElement | null)[]>([])
  const settingsRef = React.useRef(s)
  const slotsRef = React.useRef(slots)
  const state = React.useRef({
    angle: 0,
    vel: 0,
    target: 0,
    mode: "free" as Mode,
    /** 1 at full auto-spin speed, eased to 0 while hovered. */
    spin: 1,
    hovering: false,
    focused: false,
    hoverSlot: -1,
    hover: [] as number[],
    dirty: true,
    visible: true,
    reduced: false,
    fit: 1,
  })
  const drag = React.useRef<{
    id: number
    startX: number
    startY: number
    cx: number
    cy: number
    lastPhi: number
    turned: number
    startAngle: number
    moved: boolean
    samples: { t: number; angle: number }[]
  } | null>(null)
  const suppressClick = React.useRef(false)

  React.useEffect(() => {
    settingsRef.current = s
    slotsRef.current = slots
    state.current.dirty = true
  })

  const stepDeg = () => 360 / Math.max(1, slotsRef.current.length)

  const seekBy = (delta: number) => {
    const st = state.current
    const base = st.mode === "seek" ? st.target : st.angle
    st.target = base + delta
    st.vel = 0
    st.mode = "seek"
  }

  // Reduced motion: no auto-spin and a quicker settle.
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

  // Scale the whole ring down to fit small containers.
  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      const c = settingsRef.current
      const fit = Math.min(width, height) / (c.radius * 2 + c.maxSize * c.hoverScale + 24)
      state.current.fit = clamp(fit, 0.3, 1)
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
      if (st.mode === "seek") st.mode = "free"
      st.vel = clamp(st.vel + delta * 0.5 * c.dragSensitivity, -720, 720)
    }
    root.addEventListener("wheel", onWheel, { passive: false })
    return () => root.removeEventListener("wheel", onWheel)
  }, [])

  // Animation loop. Writes styles straight to the DOM so React never re-renders per frame.
  React.useEffect(() => {
    let raf = 0
    let last = performance.now()

    const render = (c: Config) => {
      const st = state.current
      const n = slotsRef.current.length
      for (let i = 0; i < n; i++) {
        const el = itemRefs.current[i]
        if (el) Object.assign(el.style, placeTile(st.angle + (i * 360) / n, st.hover[i] ?? 0, c))
      }
    }

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const st = state.current
      const n = slotsRef.current.length
      if (!st.visible || !n || dt <= 0) return
      const c: Config = { ...settingsRef.current, fit: st.fit, reduced: st.reduced }
      const frames = dt * 60
      const prev = st.angle
      let changed = st.dirty

      const held = (c.pauseOnHover && st.hovering) || st.focused || st.mode === "drag"
      const spinTarget = c.autoSpin && !c.reduced && !held ? 1 : 0
      st.spin += (spinTarget - st.spin) * (1 - Math.pow(0.93, frames))
      if (Math.abs(spinTarget - st.spin) < 0.001) st.spin = spinTarget

      switch (st.mode) {
        case "drag":
          break
        case "seek": {
          const k = c.reduced ? 0.5 : 0.14
          st.angle += (st.target - st.angle) * (1 - Math.pow(1 - k, frames))
          if (Math.abs(st.target - st.angle) < 0.01) {
            st.angle = st.target
            st.mode = "free"
          }
          break
        }
        case "free": {
          const dir = c.direction === "counterclockwise" ? -1 : 1
          const cruise = dir * c.speed * st.spin
          st.vel = cruise + (st.vel - cruise) * Math.pow(clamp(c.glide, 0, 0.995), frames)
          if (Math.abs(st.vel - cruise) < 0.05) st.vel = cruise
          if (st.vel !== 0) st.angle += st.vel * dt
          break
        }
      }

      // Ease each tile's hover amount toward 1 for the hovered tile and 0 for the rest.
      for (let i = 0; i < n; i++) {
        const cur = st.hover[i] ?? 0
        const goal = i === st.hoverSlot ? 1 : 0
        if (cur === goal) continue
        const next = cur + (goal - cur) * (1 - Math.pow(c.reduced ? 0.4 : 0.78, frames))
        st.hover[i] = Math.abs(goal - next) < 0.002 ? goal : next
        changed = true
      }

      if (st.angle !== prev || changed) {
        st.dirty = false
        render(c)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  /** Pointer angle around the ring centre, in degrees clockwise from 12 o'clock. */
  const pointerAngle = (x: number, y: number, cx: number, cy: number) =>
    (Math.atan2(x - cx, cy - y) * 180) / Math.PI

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!s.draggable || e.button !== 0 || !slots.length) return
    const rect = e.currentTarget.getBoundingClientRect()
    const cx = rect.left + rect.width / 2
    const cy = rect.top + rect.height / 2
    const st = state.current
    suppressClick.current = false
    drag.current = {
      id: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      cx,
      cy,
      lastPhi: pointerAngle(e.clientX, e.clientY, cx, cy),
      turned: 0,
      startAngle: st.angle,
      moved: false,
      samples: [{ t: performance.now(), angle: st.angle }],
    }
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    const st = state.current
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.startX, e.clientY - d.startY) < 5) return
      // Capture only once it is clearly a drag, so a plain tap still reaches a tile's link.
      d.moved = true
      e.currentTarget.setPointerCapture(e.pointerId)
      st.mode = "drag"
      st.vel = 0
      if (s.grabCursor) e.currentTarget.style.cursor = "grabbing"
    }

    // Unwrapped angular travel. Ignore the jittery zone right at the centre.
    if (Math.hypot(e.clientX - d.cx, e.clientY - d.cy) > 24) {
      const phi = pointerAngle(e.clientX, e.clientY, d.cx, d.cy)
      d.turned += angleDiff(phi, d.lastPhi)
      d.lastPhi = phi
    }

    const k = clamp(s.smoothing, 0, 0.95)
    const goal = d.startAngle + d.turned * s.dragSensitivity
    st.angle += (goal - st.angle) * (1 - k)
    const now = performance.now()
    d.samples.push({ t: now, angle: goal })
    while (d.samples.length > 2 && now - d.samples[0].t > 100) d.samples.shift()
  }

  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current
    if (!d || d.id !== e.pointerId) return
    drag.current = null
    if (!d.moved) return
    suppressClick.current = true
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId)
    if (s.grabCursor) e.currentTarget.style.cursor = "grab"
    const st = state.current
    const now = performance.now()
    const first = d.samples[0]
    const lastSample = d.samples[d.samples.length - 1]
    const stale = now - lastSample.t > 80
    const vel = now > first.t ? ((lastSample.angle - first.angle) / (now - first.t)) * 1000 : 0
    st.vel = stale ? 0 : clamp(vel, -1080, 1080)
    st.mode = "free"
  }

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" || e.key === "ArrowDown") seekBy(stepDeg())
    else if (e.key === "ArrowLeft" || e.key === "ArrowUp") seekBy(-stepDeg())
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
        touchAction: "pan-y",
        cursor: s.draggable && s.grabCursor ? "grab" : undefined,
        ...style,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onPointerEnter={(e) => {
        if (e.pointerType === "mouse") state.current.hovering = true
      }}
      onPointerLeave={(e) => {
        if (e.pointerType !== "mouse") return
        state.current.hovering = false
        state.current.hoverSlot = -1
      }}
      onClickCapture={(e) => {
        if (!suppressClick.current) return
        suppressClick.current = false
        e.preventDefault()
        e.stopPropagation()
      }}
      onFocus={(e) => {
        if (e.target !== e.currentTarget) state.current.focused = true
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
          state.current.focused = false
          state.current.hoverSlot = -1
        }
      }}
      onKeyDown={onKeyDown}
    >
      {slots.map((itemIndex, i) => {
        const item = items[itemIndex]
        const Tile = item.href ? "a" : "div"
        const media = isVideo(item) ? (
          <video
            src={item.src}
            poster={item.poster}
            aria-label={item.alt}
            muted
            loop
            autoPlay
            playsInline
            preload="metadata"
            className="pointer-events-none block size-full"
            style={{ objectFit: s.objectFit }}
          />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.src}
            alt={item.alt ?? ""}
            draggable={false}
            decoding="async"
            className="pointer-events-none block size-full select-none"
            style={{ objectFit: s.objectFit }}
          />
        )
        return (
          <Tile
            key={i}
            ref={(el: HTMLElement | null) => {
              itemRefs.current[i] = el
            }}
            {...(item.href
              ? {
                  href: item.href,
                  target: item.target,
                  rel: item.target === "_blank" ? "noopener noreferrer" : undefined,
                  draggable: false,
                }
              : {})}
            // Repeated passes are hidden from assistive tech so each item is announced once.
            aria-hidden={i >= items.length || undefined}
            tabIndex={item.href && i >= items.length ? -1 : undefined}
            onPointerEnter={(e: React.PointerEvent) => {
              if (e.pointerType === "mouse" && !drag.current?.moved) state.current.hoverSlot = i
            }}
            onPointerLeave={(e: React.PointerEvent) => {
              if (e.pointerType === "mouse" && state.current.hoverSlot === i) state.current.hoverSlot = -1
            }}
            onFocus={() => {
              state.current.hoverSlot = i
            }}
            className="outline-none focus-visible:ring-2 focus-visible:ring-ring"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: s.maxSize,
              height: s.maxSize,
              marginLeft: -s.maxSize / 2,
              marginTop: -s.maxSize / 2,
              borderRadius: s.cornerRadius,
              overflow: "hidden",
              willChange: "transform, opacity",
              background: "var(--muted, #111)",
              ...placeTile((i * 360) / slots.length, 0, initial),
            }}
          >
            {media}
          </Tile>
        )
      })}
    </div>
  )
}
