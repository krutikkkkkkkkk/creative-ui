"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type WaxSealColor = "oxblood" | "black" | "gold" | "teal"

/** Base wax colours. Highlights and shadows are mixed from these. */
export const waxSealColors: Record<WaxSealColor, string> = {
  oxblood: "#7a2a23",
  black: "#2a2522",
  gold: "#b8893a",
  teal: "#387478",
}

/** Seal radius and resting dot radius, in viewBox units (the viewBox is 100 wide). */
const R = 33
const DOT = 4.5
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)"

function mulberry32(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/** Mixes a #rrggbb colour toward white (amount > 0) or black (amount < 0). */
function shade(hex: string, amount: number) {
  const clean = hex.trim().replace(/^#/, "")
  const full =
    clean.length === 3
      ? clean
          .split("")
          .map((c) => c + c)
          .join("")
      : clean.slice(0, 6)
  const n = Number.parseInt(full, 16)
  if (full.length !== 6 || Number.isNaN(n)) return hex
  const target = amount > 0 ? 255 : 0
  const t = Math.abs(amount)
  const ch = (v: number) =>
    Math.round(v + (target - v) * t)
      .toString(16)
      .padStart(2, "0")
  return `#${ch((n >> 16) & 255)}${ch((n >> 8) & 255)}${ch(n & 255)}`
}

type Blob = {
  waves: { k: number; amp: number; phase: number; drift: number }[]
  lumps: { angle: number; amp: number; width: number }[]
}

function makeBlob(seed: number): Blob {
  const rand = mulberry32(seed)
  return {
    waves: [2, 3, 4, 5, 7].map((k) => ({
      k,
      amp: 0.008 + rand() * 0.014,
      phase: rand() * Math.PI * 2,
      drift: (rand() - 0.5) * 3,
    })),
    lumps: Array.from({ length: 5 }, () => ({
      angle: rand() * Math.PI * 2,
      amp: 0.04 + rand() * 0.08,
      width: 0.16 + rand() * 0.2,
    })),
  }
}

/**
 * The wax outline as a smooth closed path. The low waves drift with `p`, so lobes lead and lag while
 * the pool spreads instead of a fixed shape scaling up. `spread` adds the overflow squeezed out by the stamp.
 */
function blobPath(blob: Blob, radius: number, p: number, spread: number) {
  const n = 36
  const pts: [number, number][] = []
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2
    let m = 1 + 0.06 * spread
    for (const w of blob.waves) m += w.amp * Math.sin(w.k * a + w.phase + w.drift * p)
    for (const l of blob.lumps) {
      const d = Math.atan2(Math.sin(a - l.angle), Math.cos(a - l.angle)) / l.width
      m += spread * l.amp * Math.exp(-d * d)
    }
    pts.push([50 + Math.cos(a) * radius * m, 50 + Math.sin(a) * radius * m])
  }
  const f = (v: number) => v.toFixed(2)
  let d = `M${f(pts[0][0])} ${f(pts[0][1])}`
  // Closed Catmull-Rom through the points, written as cubic Beziers.
  for (let i = 0; i < n; i++) {
    const p0 = pts[(i - 1 + n) % n]
    const p1 = pts[i]
    const p2 = pts[(i + 1) % n]
    const p3 = pts[(i + 2) % n]
    d += `C${f(p1[0] + (p2[0] - p0[0]) / 6)} ${f(p1[1] + (p2[1] - p0[1]) / 6)} ${f(p2[0] - (p3[0] - p1[0]) / 6)} ${f(p2[1] - (p3[1] - p1[1]) / 6)} ${f(p2[0])} ${f(p2[1])}`
  }
  return d + "Z"
}

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
  mq.addEventListener("change", cb)
  return () => mq.removeEventListener("change", cb)
}

function useReducedMotion() {
  return React.useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false
  )
}

/** The beaded ring stamped around the impression, at fixed positions so server and client agree. */
const BEADS = Array.from({ length: 26 }, (_, i) => {
  const a = (i / 26) * Math.PI * 2
  return [Number((50 + Math.cos(a) * 27.6).toFixed(2)), Number((50 + Math.sin(a) * 27.6).toFixed(2))] as const
})

type Pt = [number, number]

/**
 * A fracture across the seal: two jagged arms running out from just off centre, where the thumb presses,
 * plus a couple of short side cracks. Points are in viewBox units, which match percentages of the box.
 */
function makeCrack(seed: number) {
  const rand = mulberry32(seed * 31 + 5)
  const c: Pt = [50 + (rand() - 0.5) * 4, 50 + (rand() - 0.5) * 6]
  const walk = (from: Pt, dir: number, length: number, steps: number) => {
    const pts: Pt[] = [from]
    let [x, y] = from
    for (let i = 0; i < steps; i++) {
      const a = dir + (rand() - 0.5) * 0.9
      x += (Math.cos(a) * length) / steps
      y += (Math.sin(a) * length) / steps
      pts.push([Number(x.toFixed(2)), Number(y.toFixed(2))])
    }
    return pts
  }
  const tilt = (rand() - 0.5) * 0.5
  const left = walk(c, Math.PI + tilt, 54, 7)
  const right = walk(c, tilt, 54, 7)
  const side = (arm: Pt[], dir: number) =>
    walk(arm[3], dir + (rand() > 0.5 ? 1 : -1) * (0.7 + rand() * 0.4), 9 + rand() * 5, 3)
  const branches = [side(left, Math.PI + tilt), side(right, tilt)]
  const line = [...left].reverse().concat(right.slice(1))
  const [l, r] = [line[0], line[line.length - 1]]
  const polygon = (pts: Pt[]) => `polygon(${pts.map(([x, y]) => `${x}% ${y}%`).join(", ")})`
  const toPath = (pts: Pt[]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join("")
  return {
    arms: [toPath(left), toPath(right)],
    branches: branches.map(toPath),
    top: polygon([[-10, l[1]], ...line, [110, r[1]], [110, -10], [-10, -10]]),
    bottom: polygon([[-10, l[1]], ...line, [110, r[1]], [110, 110], [-10, 110]]),
    // Each half hinges on the far end of the crack, so the break opens like a pair of scissors.
    hinges: [`${r[0]}% ${r[1]}%`, `${l[0]}% ${l[1]}%`],
    crumbs: [line[3], line[5], line[7], line[9], line[11]].map(([x, y]) => ({
      x,
      y,
      r: 1.1 + rand() * 1.1,
      dx: (rand() - 0.5) * 16,
      dy: 22 + rand() * 22,
      turn: (rand() - 0.5) * 540,
      delay: rand() * 60,
    })),
  }
}

/** Gradients and blur shared by every copy of the seal art in one instance, plus the wax outline as a clip. */
function SealDefs({ id, base, clip }: { id: string; base: string; clip?: string }) {
  return (
    <svg aria-hidden className="pointer-events-none absolute size-0 overflow-hidden" focusable="false">
      <defs>
        <radialGradient id={`${id}-body`} cx="0.36" cy="0.3" r="0.78">
          <stop offset="0" stopColor={shade(base, 0.22)} />
          <stop offset="0.5" stopColor={base} />
          <stop offset="1" stopColor={shade(base, -0.45)} />
        </radialGradient>
        <linearGradient id={`${id}-face`} x1="0.15" y1="0.1" x2="0.85" y2="0.95">
          <stop offset="0" stopColor={shade(base, -0.38)} />
          <stop offset="0.55" stopColor={shade(base, -0.12)} />
          <stop offset="1" stopColor={shade(base, 0.06)} />
        </linearGradient>
        <radialGradient id={`${id}-bead`} cx="0.35" cy="0.3" r="0.8">
          <stop offset="0" stopColor={shade(base, 0.35)} />
          <stop offset="0.6" stopColor={base} />
          <stop offset="1" stopColor={shade(base, -0.4)} />
        </radialGradient>
        <filter id={`${id}-soft`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.4" />
        </filter>
        {clip && (
          <clipPath id={`${id}-wax`}>
            <path d={clip} />
          </clipPath>
        )}
      </defs>
    </svg>
  )
}

interface SealFaceProps {
  id: string
  base: string
  size: number
  /** Wax outline and gloss transform for the first paint. */
  d: string
  gloss: string
  impression: React.ReactNode
  /** Dashed ring marking where the wax will land. */
  outline?: boolean
  faceClassName?: string
  impressionClassName?: string
  waxRef?: React.Ref<SVGGElement>
  glossRef?: React.Ref<SVGGElement>
  pathRef?: (index: number) => (el: SVGPathElement | null) => void
  /** Extra SVG drawn over the seal, such as cracks. */
  children?: React.ReactNode
}

/** The wax, the stamped face and the impression. Fills its positioned parent. */
function SealFace({
  id,
  base,
  size,
  d,
  gloss,
  impression,
  outline,
  faceClassName,
  impressionClassName,
  waxRef,
  glossRef,
  pathRef,
  children,
}: SealFaceProps) {
  const relief = Math.max(1, size * 0.012)
  return (
    <>
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible" focusable="false">
        {outline && (
          <circle
            cx="50"
            cy="50"
            r={R}
            fill="none"
            stroke="currentColor"
            strokeWidth="0.8"
            strokeDasharray="1.5 3"
            className="opacity-35 transition-opacity duration-200 group-hover/wax-seal:opacity-60 group-data-[state=sealed]/wax-seal:opacity-0"
          />
        )}

        <g ref={waxRef}>
          <path
            ref={pathRef?.(0)}
            d={d}
            fill="#000"
            opacity="0.3"
            transform="translate(0.6 1.8)"
            filter={`url(#${id}-soft)`}
          />
          <path ref={pathRef?.(1)} d={d} fill={`url(#${id}-body)`} />
          <path
            ref={pathRef?.(2)}
            d={d}
            fill="none"
            stroke={shade(base, -0.5)}
            strokeOpacity="0.45"
            strokeWidth="0.6"
          />
          <g ref={glossRef} transform={gloss}>
            <path
              d="M22 42.5A29 29 0 0 1 42.5 22"
              fill="none"
              stroke="#fff"
              strokeOpacity="0.38"
              strokeWidth="2.6"
              strokeLinecap="round"
              filter={`url(#${id}-soft)`}
            />
            <circle cx="29.5" cy="33" r="1.3" fill="#fff" fillOpacity="0.55" />
          </g>
        </g>

        <g className={faceClassName}>
          <circle cx="50" cy="50" r="25" fill="none" stroke={shade(base, -0.5)} strokeOpacity="0.35" strokeWidth="0.8" />
          {BEADS.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="1.35" fill={`url(#${id}-bead)`} />
          ))}
          <circle cx="50" cy="50" r="22" fill={`url(#${id}-face)`} />
          {/* The stamp wall: shadowed where light can't reach, lit on the far side. */}
          <circle cx="50" cy="50" r="22" fill="none" stroke={shade(base, -0.6)} strokeOpacity="0.55" strokeWidth="1.2" />
          <path
            d="M65.6 65.6A22 22 0 0 1 34.4 65.6"
            fill="none"
            stroke={shade(base, 0.4)}
            strokeOpacity="0.45"
            strokeWidth="0.7"
            transform="translate(0 0.9)"
          />
        </g>

        {children}
      </svg>

      <span
        className={cn("absolute inset-0 flex items-center justify-center leading-none", impressionClassName)}
        style={{
          color: shade(base, -0.32),
          fontSize: size * 0.3,
          transitionTimingFunction: EASE_OUT,
          // Debossed: the top edge of each stroke falls in shadow, the bottom edge catches light.
          filter: `drop-shadow(0 ${-relief}px 0 ${shade(base, -0.62)}) drop-shadow(0 ${relief}px 0 ${shade(base, 0.3)})`,
        }}
      >
        {impression}
      </span>
    </>
  )
}

type Phase = "idle" | "holding" | "releasing" | "pressing" | "sealed"

export interface WaxSealProps extends Omit<React.ComponentProps<"button">, "children" | "color"> {
  /**
   * "seal" starts bare: holding pools wax and stamps it. "open" starts stamped: holding strains the wax
   * until it cracks and snaps in two. Default "seal".
   */
  variant?: "seal" | "open"
  /** Called once when a hold completes and the seal is stamped. */
  onSeal?: () => void
  /** How long the press must be held, in ms. Default 1100. */
  holdDuration?: number
  /** A named wax colour or any #rrggbb hex. Default "oxblood". */
  color?: WaxSealColor | (string & {})
  /** Controlled sealed state. Pair with `onSealedChange`. */
  sealed?: boolean
  /** Initial sealed state when uncontrolled. Default false. */
  defaultSealed?: boolean
  /** Called with `true` when a hold completes, and with `false` when the seal is broken. */
  onSealedChange?: (sealed: boolean) => void
  /** Let a click on a sealed button break the seal. Default false. */
  resetOnClick?: boolean
  /** The impression the stamp leaves: a letter, monogram or icon. Text is sized at about a third of `size`. */
  children?: React.ReactNode
  /** Called once when a hold completes and the seal breaks. "open" only. */
  onOpen?: () => void
  /** Visible label before the hold completes. Default "Hold to seal", or "Hold to open". */
  label?: React.ReactNode
  /** Visible label once sealed. Also announced to screen readers. Default "Sealed". */
  sealedLabel?: string
  /** Visible label once the seal is broken. Also announced to screen readers. Default "Opened". "open" only. */
  openedLabel?: string
  /** Read by screen readers. Default "Press and hold to confirm", or "Press and hold to break the seal". */
  hint?: string
  /** Diameter of the seal area in px. Default 88. */
  size?: number
  /** Seed for the shape of the wax. Default 7. */
  seed?: number
  /** Buzz the device on seal or break where the Vibration API exists. Default true. */
  haptics?: boolean
}

/**
 * A press-and-hold confirm button with a wax seal, in two variants. "seal" pools molten wax from the
 * centre and stamps an embossed impression into it; "open" starts stamped and cracks the wax in two.
 * Releasing early undoes the hold either way.
 */
export function WaxSeal({
  variant = "seal",
  onOpen,
  openedLabel,
  onSeal,
  resetOnClick,
  sealedLabel,
  ...props
}: WaxSealProps) {
  if (variant === "open") return <OpenSeal onOpen={onOpen} openedLabel={openedLabel} {...props} />
  return <StampSeal onSeal={onSeal} resetOnClick={resetOnClick} sealedLabel={sealedLabel} {...props} />
}

type SharedProps = Omit<WaxSealProps, "variant" | "onOpen" | "openedLabel" | "onSeal" | "resetOnClick" | "sealedLabel">

function StampSeal({
  onSeal,
  holdDuration = 1100,
  color = "oxblood",
  sealed: sealedProp,
  defaultSealed = false,
  onSealedChange,
  resetOnClick = false,
  children,
  label = "Hold to seal",
  sealedLabel = "Sealed",
  hint = "Press and hold to confirm",
  size = 88,
  seed = 7,
  haptics = true,
  disabled,
  className,
  style,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  onBlur,
  onClick,
  onContextMenu,
  ...props
}: SharedProps & Pick<WaxSealProps, "onSeal" | "resetOnClick" | "sealedLabel">) {
  const id = React.useId().replace(/[^\w-]/g, "")
  const reduced = useReducedMotion()
  const [innerSealed, setInnerSealed] = React.useState(defaultSealed)
  const sealed = sealedProp ?? innerSealed
  const [holding, setHolding] = React.useState(false)

  const base = color in waxSealColors ? waxSealColors[color as WaxSealColor] : color
  const blob = React.useMemo(() => makeBlob(seed), [seed])

  const stampRef = React.useRef<HTMLSpanElement>(null)
  const waxRef = React.useRef<SVGGElement>(null)
  const glossRef = React.useRef<SVGGElement>(null)
  const pathRefs = React.useRef<(SVGPathElement | null)[]>([])
  const pressShadowRef = React.useRef<SVGCircleElement>(null)
  const sim = React.useRef({
    phase: (sealed ? "sealed" : "idle") as Phase,
    p: sealed ? 1 : 0,
    spread: sealed ? 1 : 0,
    pressT: 0,
  })
  const raf = React.useRef(0)
  const last = React.useRef(0)
  const pressBeganSealed = React.useRef(false)

  // Handlers run outside render; they read the latest props from here.
  const setSealed = React.useCallback(
    (next: boolean) => {
      if (sealedProp === undefined) setInnerSealed(next)
      onSealedChange?.(next)
    },
    [sealedProp, onSealedChange]
  )
  const latest = React.useRef({ blob, reduced, holdDuration, haptics, onSeal, setSealed })
  React.useEffect(() => {
    latest.current = { blob, reduced, holdDuration, haptics, onSeal, setSealed }
  })

  // The first frame comes from render so the server markup already shows the right state; after that
  // the loop owns these attributes and React never touches them again.
  const [initial] = React.useState(() => ({
    d: blobPath(blob, sealed ? R : DOT, sealed ? 1 : 0, sealed ? 1 : 0),
    gloss: `translate(50 50) scale(${sealed ? 1.06 : DOT / R}) translate(-50 -50)`,
  }))

  const draw = React.useCallback(() => {
    const s = sim.current
    const { blob, reduced } = latest.current
    // A pool fed at a steady rate grows in area, not radius, so the edge races out then slows.
    const radius = reduced ? (s.p > 0 ? R : DOT) : DOT + (R - DOT) * Math.sqrt(s.p)
    const d = blobPath(blob, radius, s.p, s.spread)
    for (const path of pathRefs.current) path?.setAttribute("d", d)
    glossRef.current?.setAttribute(
      "transform",
      `translate(50 50) scale(${((radius / R) * (1 + 0.06 * s.spread)).toFixed(4)}) translate(-50 -50)`
    )
    // Reduced motion: the seal is drawn full size and fills in by opacity instead of spreading.
    if (waxRef.current) waxRef.current.style.opacity = reduced && s.p > 0 ? String(0.2 + 0.8 * s.p) : "1"
  }, [])

  const stamp = React.useCallback(() => {
    const s = sim.current
    const { reduced, haptics, onSeal, setSealed } = latest.current
    s.phase = reduced ? "sealed" : "pressing"
    s.p = 1
    s.pressT = 0
    if (reduced) s.spread = 1
    setHolding(false)
    setSealed(true)
    onSeal?.()
    if (haptics) {
      try {
        navigator.vibrate?.([14, 50, 22])
      } catch {}
    }
    if (reduced) return
    // Squash as the stamp lands, a small rebound as it lifts.
    stampRef.current?.animate(
      [
        { transform: "scale(1)" },
        { transform: "scale(0.9, 0.87)", offset: 0.32 },
        { transform: "scale(1.03)", offset: 0.66 },
        { transform: "scale(1)" },
      ],
      { duration: 460, easing: "ease-out" }
    )
    pressShadowRef.current?.animate([{ opacity: 0 }, { opacity: 0.4, offset: 0.3 }, { opacity: 0 }], {
      duration: 420,
      easing: "ease-out",
    })
  }, [])

  const tick = React.useCallback(
    (now: number) => {
      const s = sim.current
      // The first rAF timestamp can predate the performance.now() taken when the loop was kicked.
      const dt = Math.min(48, Math.max(0, now - last.current))
      last.current = now
      if (s.phase === "holding") {
        // Linear: this is progress, and progress shouldn't ease.
        s.p = Math.min(1, s.p + dt / Math.max(100, latest.current.holdDuration))
        if (s.p >= 1) stamp()
      } else if (s.phase === "releasing") {
        // Exponential decay is an ease-out that can be caught and reversed at any point.
        const k = Math.exp(-dt / 70)
        s.p *= k
        s.spread *= k
        if (s.p < 0.002) {
          s.p = 0
          s.spread = 0
          s.phase = "idle"
        }
      } else if (s.phase === "pressing") {
        s.pressT = Math.min(1, s.pressT + dt / 300)
        s.spread = 1 - Math.pow(1 - s.pressT, 3)
        if (s.pressT >= 1) s.phase = "sealed"
      }
      draw()
      const busy = s.phase === "holding" || s.phase === "releasing" || s.phase === "pressing"
      raf.current = busy ? requestAnimationFrame(tick) : 0
    },
    [draw, stamp]
  )

  const kick = React.useCallback(() => {
    if (raf.current) return
    last.current = performance.now()
    raf.current = requestAnimationFrame(tick)
  }, [tick])

  React.useEffect(() => () => cancelAnimationFrame(raf.current), [])

  // Redraw when the shape or motion preference changes while nothing is animating.
  React.useEffect(() => {
    if (!raf.current) draw()
  }, [blob, reduced, draw])

  // Follow outside changes to `sealed`: a reset retracts the wax, an outside seal snaps it in place.
  React.useEffect(() => {
    const s = sim.current
    const down = s.phase === "pressing" || s.phase === "sealed"
    if (sealed && !down) {
      Object.assign(s, { phase: "sealed", p: 1, spread: 1 })
      if (!raf.current) draw()
    } else if (!sealed && down) {
      s.phase = "releasing"
      kick()
    }
  }, [sealed, draw, kick])

  const start = () => {
    const s = sim.current
    if (disabled || s.phase === "pressing" || s.phase === "sealed") return
    s.phase = "holding"
    setHolding(true)
    kick()
  }

  const release = () => {
    const s = sim.current
    if (s.phase !== "holding") return
    s.phase = "releasing"
    setHolding(false)
    kick()
  }

  React.useEffect(() => {
    if (disabled && sim.current.phase === "holding") {
      sim.current.phase = "releasing"
      setHolding(false)
      kick()
    }
  }, [disabled, kick])

  const isKey = (e: React.KeyboardEvent) => e.key === " " || e.key === "Enter"
  const inert = sealed && !resetOnClick

  return (
    <>
      <SealDefs id={id} base={base} />
      <button
        type="button"
        data-slot="wax-seal"
        data-state={sealed ? "sealed" : "open"}
        data-holding={holding || undefined}
        disabled={disabled}
        aria-disabled={inert || undefined}
        aria-describedby={`${id}-hint`}
        className={cn(
          "group/wax-seal relative inline-flex touch-manipulation flex-col items-center gap-2 rounded-xl p-2 outline-none select-none [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent]",
          "focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
          inert ? "cursor-default" : "cursor-pointer",
          className
        )}
        style={style}
        onPointerDown={(e) => {
          onPointerDown?.(e)
          if (e.button !== 0 || !e.isPrimary) return
          pressBeganSealed.current = sealed
          if (!sealed) start()
        }}
        onPointerUp={(e) => {
          onPointerUp?.(e)
          // Breaking the seal needs its own press, so the press that sealed it can't also break it.
          if (pressBeganSealed.current && sealed && resetOnClick) setSealed(false)
          pressBeganSealed.current = false
          release()
        }}
        onPointerLeave={(e) => {
          onPointerLeave?.(e)
          pressBeganSealed.current = false
          release()
        }}
        onPointerCancel={(e) => {
          // Fires when a touch turns into a scroll; that must never seal.
          onPointerCancel?.(e)
          pressBeganSealed.current = false
          release()
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (!isKey(e)) return
          // Stop the native click (and page scroll on Space); holding is handled here.
          e.preventDefault()
          if (e.repeat) return
          if (sealed) {
            if (resetOnClick) setSealed(false)
          } else start()
        }}
        onKeyUp={(e) => {
          onKeyUp?.(e)
          if (!isKey(e)) return
          e.preventDefault()
          release()
        }}
        onBlur={(e) => {
          onBlur?.(e)
          release()
        }}
        onClick={(e) => {
          onClick?.(e)
          // detail 0 with keys suppressed above means assistive tech activated the button.
          if (e.detail === 0 && sealed && resetOnClick) setSealed(false)
        }}
        onContextMenu={(e) => {
          onContextMenu?.(e)
          // A long press on touch opens the context menu otherwise.
          e.preventDefault()
        }}
        {...props}
      >
        <span
          aria-hidden
          className="relative block transition-transform duration-150 ease-out motion-safe:group-data-[holding]/wax-seal:scale-[0.97]"
          style={{ width: size, height: size }}
        >
          <span ref={stampRef} className="absolute inset-0 block">
            <SealFace
              id={id}
              base={base}
              size={size}
              d={initial.d}
              gloss={initial.gloss}
              impression={children}
              outline
              waxRef={waxRef}
              glossRef={glossRef}
              pathRef={(i) => (el) => {
                pathRefs.current[i] = el
              }}
              faceClassName="opacity-0 transition-opacity duration-150 group-data-[state=sealed]/wax-seal:opacity-100 group-data-[state=sealed]/wax-seal:delay-150 group-data-[state=sealed]/wax-seal:duration-300"
              impressionClassName="opacity-0 transition-[opacity,transform] duration-150 group-data-[state=sealed]/wax-seal:opacity-100 group-data-[state=sealed]/wax-seal:delay-150 group-data-[state=sealed]/wax-seal:duration-300 motion-safe:scale-105 motion-safe:group-data-[state=sealed]/wax-seal:scale-100"
            >
              <circle ref={pressShadowRef} cx="50" cy="50" r="24" fill="#000" opacity="0" />
            </SealFace>
          </span>
        </span>

        <span className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">
          {sealed ? sealedLabel : label}
        </span>
      </button>
      {/* Outside the button so neither ends up in its accessible name. */}
      <span id={`${id}-hint`} className="sr-only">
        {sealed ? (resetOnClick ? "Press to break the seal" : "") : hint}
      </span>
      <span role="status" aria-live="polite" className="sr-only">
        {sealed ? sealedLabel : ""}
      </span>
    </>
  )
}

type OpenPhase = "intact" | "straining" | "relaxing" | "broken"

/** The halves part with a quick snap that settles, like wax giving way under a thumb. */
const BREAK = [
  { transform: "translate(-1%, -2.5%) rotate(-8deg)" },
  { transform: "translate(1.5%, 2.5%) rotate(7deg)" },
]

function OpenSeal({
  onOpen,
  holdDuration = 1100,
  color = "oxblood",
  sealed: sealedProp,
  defaultSealed = true,
  onSealedChange,
  children,
  label = "Hold to open",
  openedLabel = "Opened",
  hint = "Press and hold to break the seal",
  size = 88,
  seed = 7,
  haptics = true,
  disabled,
  className,
  style,
  onPointerDown,
  onPointerUp,
  onPointerLeave,
  onPointerCancel,
  onKeyDown,
  onKeyUp,
  onBlur,
  onContextMenu,
  ...props
}: SharedProps & Pick<WaxSealProps, "onOpen" | "openedLabel">) {
  const id = React.useId().replace(/[^\w-]/g, "")
  const reduced = useReducedMotion()
  const [innerSealed, setInnerSealed] = React.useState(defaultSealed)
  const sealed = sealedProp ?? innerSealed
  const [holding, setHolding] = React.useState(false)

  const base = color in waxSealColors ? waxSealColors[color as WaxSealColor] : color
  const d = React.useMemo(() => blobPath(makeBlob(seed), R, 1, 1), [seed])
  const crack = React.useMemo(() => makeCrack(seed), [seed])
  const gloss = "translate(50 50) scale(1.06) translate(-50 -50)"

  const wholeRef = React.useRef<HTMLSpanElement>(null)
  const crackRef = React.useRef<SVGGElement>(null)
  const crumbRefs = React.useRef<(SVGGElement | null)[]>([])
  const sim = React.useRef({ phase: (sealed ? "intact" : "broken") as OpenPhase, p: 0 })
  const raf = React.useRef(0)
  const last = React.useRef(0)

  const setSealed = React.useCallback(
    (next: boolean) => {
      if (sealedProp === undefined) setInnerSealed(next)
      onSealedChange?.(next)
    },
    [sealedProp, onSealedChange]
  )
  const latest = React.useRef({ reduced, holdDuration, haptics, onOpen, setSealed })
  React.useEffect(() => {
    latest.current = { reduced, holdDuration, haptics, onOpen, setSealed }
  })

  const draw = React.useCallback((now: number) => {
    const { phase, p } = sim.current
    const { reduced } = latest.current
    const group = crackRef.current
    if (group) {
      // The crack creeps while pressure builds, then races out at the end, as a fracture does.
      const arms = reduced ? 1 : Math.pow(p, 1.4)
      const side = reduced ? 1 : Math.min(1, Math.max(0, (p - 0.6) / 0.4))
      group.style.opacity = reduced ? String(p) : "1"
      group.querySelectorAll<SVGPathElement>("[data-kind=arm]").forEach((el) => {
        el.style.strokeDashoffset = String(1 - arms)
      })
      group.querySelectorAll<SVGPathElement>("[data-kind=branch]").forEach((el) => {
        el.style.strokeDashoffset = String(1 - side)
      })
    }
    // A strained seal trembles, more as the wax nears its limit.
    if (wholeRef.current) {
      const shake = !reduced && phase === "straining" ? (Math.sin(now / 37) * 0.7 + Math.sin(now / 23) * 0.5) * p * p : 0
      wholeRef.current.style.transform = shake ? `rotate(${shake.toFixed(3)}deg)` : ""
    }
  }, [])

  const snap = React.useCallback(() => {
    const s = sim.current
    const { reduced, haptics, onOpen, setSealed } = latest.current
    s.phase = "broken"
    s.p = 1
    setHolding(false)
    setSealed(false)
    onOpen?.()
    if (haptics) {
      try {
        navigator.vibrate?.([10, 30, 26])
      } catch {}
    }
    if (reduced) return
    // Crumbs of wax shaken loose by the break: they fall, so they speed up.
    crack.crumbs.forEach((c, i) => {
      crumbRefs.current[i]?.animate(
        [
          { opacity: 1, transform: "translate(0px, 0px) rotate(0deg)" },
          { opacity: 1, offset: 0.7 },
          { opacity: 0, transform: `translate(${c.dx}px, ${c.dy}px) rotate(${c.turn}deg)` },
        ],
        { duration: 620, delay: c.delay, easing: "cubic-bezier(0.55, 0, 1, 0.45)" }
      )
    })
  }, [crack])

  const tick = React.useCallback(
    (now: number) => {
      const s = sim.current
      const dt = Math.min(48, Math.max(0, now - last.current))
      last.current = now
      if (s.phase === "straining") {
        s.p = Math.min(1, s.p + dt / Math.max(100, latest.current.holdDuration))
        if (s.p >= 1) snap()
      } else if (s.phase === "relaxing") {
        s.p *= Math.exp(-dt / 80)
        if (s.p < 0.002) {
          s.p = 0
          s.phase = "intact"
        }
      }
      draw(now)
      raf.current = s.phase === "straining" || s.phase === "relaxing" ? requestAnimationFrame(tick) : 0
    },
    [draw, snap]
  )

  const kick = React.useCallback(() => {
    if (raf.current) return
    last.current = performance.now()
    raf.current = requestAnimationFrame(tick)
  }, [tick])

  React.useEffect(() => () => cancelAnimationFrame(raf.current), [])

  React.useEffect(() => {
    if (!raf.current) draw(performance.now())
  }, [crack, reduced, draw])

  // Follow outside changes to `sealed`: a reset mends the wax, an outside break snaps it quietly.
  React.useEffect(() => {
    const s = sim.current
    if (sealed && s.phase === "broken") {
      Object.assign(s, { phase: "intact", p: 0 })
      if (!raf.current) draw(performance.now())
    } else if (!sealed && s.phase !== "broken") {
      cancelAnimationFrame(raf.current)
      raf.current = 0
      Object.assign(s, { phase: "broken", p: 1 })
      setHolding(false)
      draw(performance.now())
    }
  }, [sealed, draw])

  const start = () => {
    const s = sim.current
    if (disabled || s.phase === "broken") return
    s.phase = "straining"
    setHolding(true)
    kick()
  }

  const release = () => {
    const s = sim.current
    if (s.phase !== "straining") return
    s.phase = "relaxing"
    setHolding(false)
    kick()
  }

  React.useEffect(() => {
    if (disabled && sim.current.phase === "straining") {
      sim.current.phase = "relaxing"
      setHolding(false)
      kick()
    }
  }, [disabled, kick])

  const isKey = (e: React.KeyboardEvent) => e.key === " " || e.key === "Enter"
  const crackStroke = shade(base, -0.68)
  const lipStroke = shade(base, 0.32)
  const halves = [crack.top, crack.bottom]

  const face = (revealed: boolean) => (
    <g
      ref={revealed ? undefined : crackRef}
      clipPath={`url(#${id}-wax)`}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* A pale lip under each dark crack: the broken edge catching light. */}
      {[...crack.arms.map((a) => [a, "arm"]), ...crack.branches.map((b) => [b, "branch"])].map(([path, kind], i) => (
        <g key={i}>
          <path
            d={path}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={revealed ? 0 : 1}
            stroke={lipStroke}
            strokeOpacity="0.7"
            strokeWidth={kind === "arm" ? 0.9 : 0.55}
            transform="translate(0 0.7)"
            data-kind={kind}
          />
          <path
            d={path}
            pathLength={1}
            strokeDasharray="1 1"
            strokeDashoffset={revealed ? 0 : 1}
            stroke={crackStroke}
            strokeWidth={kind === "arm" ? 1.5 : 0.8}
            data-kind={kind}
          />
        </g>
      ))}
    </g>
  )

  return (
    <>
      <SealDefs id={id} base={base} clip={d} />
      <button
        type="button"
        data-slot="wax-seal"
        data-variant="open"
        data-state={sealed ? "sealed" : "open"}
        data-holding={holding || undefined}
        disabled={disabled}
        aria-disabled={!sealed || undefined}
        aria-describedby={`${id}-hint`}
        className={cn(
          "group/wax-seal relative inline-flex touch-manipulation flex-col items-center gap-2 rounded-xl p-2 outline-none select-none [-webkit-touch-callout:none] [-webkit-tap-highlight-color:transparent]",
          "focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
          sealed ? "cursor-pointer" : "cursor-default",
          className
        )}
        style={style}
        onPointerDown={(e) => {
          onPointerDown?.(e)
          if (e.button !== 0 || !e.isPrimary) return
          start()
        }}
        onPointerUp={(e) => {
          onPointerUp?.(e)
          release()
        }}
        onPointerLeave={(e) => {
          onPointerLeave?.(e)
          release()
        }}
        onPointerCancel={(e) => {
          // Fires when a touch turns into a scroll; that must never break the seal.
          onPointerCancel?.(e)
          release()
        }}
        onKeyDown={(e) => {
          onKeyDown?.(e)
          if (!isKey(e)) return
          e.preventDefault()
          if (!e.repeat) start()
        }}
        onKeyUp={(e) => {
          onKeyUp?.(e)
          if (!isKey(e)) return
          e.preventDefault()
          release()
        }}
        onBlur={(e) => {
          onBlur?.(e)
          release()
        }}
        onContextMenu={(e) => {
          onContextMenu?.(e)
          e.preventDefault()
        }}
        {...props}
      >
        <span
          aria-hidden
          className="relative block transition-transform duration-150 ease-out motion-safe:group-data-[holding]/wax-seal:scale-[0.97]"
          style={{ width: size, height: size }}
        >
          {/* Whole while intact. Swapping to two clipped halves only at the break avoids a hairline seam. */}
          <span ref={wholeRef} className={cn("absolute inset-0 block", !sealed && "invisible")}>
            <SealFace id={id} base={base} size={size} d={d} gloss={gloss} impression={children}>
              {face(false)}
            </SealFace>
          </span>
          {halves.map((clip, i) => (
            <span
              key={i}
              className={cn("absolute inset-0 block", sealed && "invisible")}
              style={{
                clipPath: clip,
                transformOrigin: crack.hinges[i],
                transform: sealed ? "none" : BREAK[i].transform,
                transition: reduced || sealed ? "none" : `transform 420ms ${EASE_OUT}`,
              }}
            >
              <SealFace id={id} base={base} size={size} d={d} gloss={gloss} impression={children}>
                {face(true)}
              </SealFace>
            </span>
          ))}
          <svg viewBox="0 0 100 100" className="absolute inset-0 size-full overflow-visible" focusable="false">
            {crack.crumbs.map((c, i) => (
              <g
                key={i}
                ref={(el) => {
                  crumbRefs.current[i] = el
                }}
                opacity="0"
                style={{ transformBox: "fill-box", transformOrigin: "center" }}
              >
                <circle cx={c.x} cy={c.y} r={c.r} fill={shade(base, -0.15)} />
                <circle cx={c.x - c.r * 0.3} cy={c.y - c.r * 0.3} r={c.r * 0.35} fill={shade(base, 0.3)} />
              </g>
            ))}
          </svg>
        </span>

        <span className="font-mono text-[10px] tracking-[0.18em] uppercase opacity-70">
          {sealed ? label : openedLabel}
        </span>
      </button>
      <span id={`${id}-hint`} className="sr-only">
        {sealed ? hint : ""}
      </span>
      <span role="status" aria-live="polite" className="sr-only">
        {sealed ? "" : openedLabel}
      </span>
    </>
  )
}
