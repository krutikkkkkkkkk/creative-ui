"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

type Pt = { x: number; y: number }
type Palette = { light: string; mid: string; dark: string }

const FOILS = {
  silver: { light: "#f2f4f3", mid: "#bcc4c2", dark: "#7c8684" },
  gold: { light: "#fbefc6", mid: "#d2ad5e", dark: "#8f6c28" },
  copper: { light: "#f6d6c6", mid: "#c68a6f", dark: "#80503b" },
} satisfies Record<string, Palette>

export type ScratchCardFoil = keyof typeof FOILS

/** The named foils as hex, for building your own picker. */
export const scratchCardFoils = {
  silver: FOILS.silver.mid,
  gold: FOILS.gold.mid,
  copper: FOILS.copper.mid,
} as const

/** Grid cell for measuring how much foil is gone, in px. */
const CELL = 6
/** How far flakes may fly past the card, in px: sides, top, bottom. */
const SPILL = { x: 32, top: 24, bottom: 96 }
const MAX_FLAKES = 140
const GRAVITY = 1500
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

function parseHex(hex: string) {
  const h = hex.trim().replace(/^#/, "")
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  if (!/^[0-9a-f]{6}$/i.test(full)) return null
  const n = Number.parseInt(full, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const
}

function mix(hex: string, to: number, t: number) {
  const rgb = parseHex(hex)!
  return `rgb(${rgb.map((c) => Math.round(c + (to - c) * t)).join(" ")})`
}

function paletteOf(foil: string): Palette {
  if (foil in FOILS) return FOILS[foil as ScratchCardFoil]
  if (!parseHex(foil)) return FOILS.silver
  return { light: mix(foil, 255, 0.6), mid: foil, dark: mix(foil, 0, 0.38) }
}

/** Brushed metal: a banded sheen, hairline brushing, grain, and an optional pressed-in label. */
function paintFoil(ctx: CanvasRenderingContext2D, w: number, h: number, pal: Palette, seed: number, label: string, font: string) {
  const rnd = mulberry32(seed)
  ctx.globalCompositeOperation = "source-over"
  ctx.globalAlpha = 1
  ctx.clearRect(0, 0, w, h)

  const g = ctx.createLinearGradient(0, 0, w, h * 0.6)
  g.addColorStop(0, pal.mid)
  g.addColorStop(0.22, pal.light)
  g.addColorStop(0.42, pal.mid)
  g.addColorStop(0.58, pal.dark)
  g.addColorStop(0.78, pal.light)
  g.addColorStop(1, pal.mid)
  ctx.fillStyle = pal.mid
  ctx.fillRect(0, 0, w, h)
  ctx.globalAlpha = 0.55
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  // Brushing: faint horizontal hairlines.
  ctx.lineWidth = 0.6
  for (let i = 0, n = Math.ceil(h * 2.4); i < n; i++) {
    const y = rnd() * h
    const x = rnd() * w * 0.8 - w * 0.1
    ctx.globalAlpha = 0.025 + rnd() * 0.045
    ctx.strokeStyle = rnd() < 0.5 ? "#fff" : "#000"
    ctx.beginPath()
    ctx.moveTo(x, y)
    ctx.lineTo(x + w * (0.08 + rnd() * 0.3), y)
    ctx.stroke()
  }

  // Grain.
  for (let i = 0, n = Math.floor((w * h) / 10); i < n; i++) {
    ctx.globalAlpha = 0.05 + rnd() * 0.12
    ctx.fillStyle = rnd() < 0.5 ? "#fff" : "#000"
    ctx.fillRect(rnd() * w, rnd() * h, 1, 1)
  }

  // Lit top edge, shaded bottom edge.
  ctx.globalAlpha = 0.6
  ctx.fillStyle = "#fff"
  ctx.fillRect(0, 0, w, 1)
  ctx.globalAlpha = 0.25
  ctx.fillStyle = "#000"
  ctx.fillRect(0, h - 1, w, 1)

  if (label) {
    const size = Math.max(9, Math.min(15, h * 0.16))
    ctx.font = `600 ${size}px ${font}`
    ctx.textAlign = "center"
    ctx.textBaseline = "middle"
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${(size * 0.22).toFixed(1)}px`
    const text = label.toUpperCase()
    ctx.globalAlpha = 0.7
    ctx.fillStyle = pal.light
    ctx.fillText(text, w / 2, h / 2 + 1)
    ctx.globalAlpha = 0.45
    ctx.fillStyle = pal.dark
    ctx.fillText(text, w / 2, h / 2)
  }
  ctx.globalAlpha = 1
}

interface Options {
  brush: number
  threshold: number
  seed: number
  pal: Palette
  label: string
  flakes: boolean
  onStart: () => void
  onProgress: (p: number) => void
  onComplete: () => void
}

interface Stroke {
  brush: number
  /** Points normalised to the card, so a resize can replay them. */
  pts: Pt[]
}

interface Flake {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  vr: number
  flip: number
  vflip: number
  size: number
  color: string
  age: number
  life: number
}

/** Everything per frame lives here, outside React. */
function createScratch(host: HTMLElement, canvas: HTMLCanvasElement, dust: HTMLCanvasElement, get: () => Options) {
  const ctx = canvas.getContext("2d")!
  const dctx = dust.getContext("2d")!
  const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

  const s = {
    w: 0,
    h: 0,
    rect: null as DOMRect | null,
    strokes: [] as Stroke[],
    stroke: null as Stroke | null,
    pointer: null as number | null,
    last: null as Pt | null,
    cols: 0,
    rows: 0,
    grid: new Uint8Array(0),
    cleared: 0,
    reported: -1,
    seg: 0,
    started: false,
    done: false,
    flakes: [] as Flake[],
    raf: 0,
    prev: 0,
  }

  function markGrid(a: Pt, b: Pt, r: number) {
    const reach = r * 0.85
    const c0 = Math.max(0, Math.floor((Math.min(a.x, b.x) - r) / CELL))
    const c1 = Math.min(s.cols - 1, Math.floor((Math.max(a.x, b.x) + r) / CELL))
    const r0 = Math.max(0, Math.floor((Math.min(a.y, b.y) - r) / CELL))
    const r1 = Math.min(s.rows - 1, Math.floor((Math.max(a.y, b.y) + r) / CELL))
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len2 = dx * dx + dy * dy
    for (let row = r0; row <= r1; row++) {
      for (let col = c0; col <= c1; col++) {
        const i = row * s.cols + col
        if (s.grid[i]) continue
        const px = (col + 0.5) * CELL
        const py = (row + 0.5) * CELL
        const t = len2 ? Math.max(0, Math.min(1, ((px - a.x) * dx + (py - a.y) * dy) / len2)) : 0
        if (Math.hypot(px - (a.x + dx * t), py - (a.y + dy * t)) <= reach) {
          s.grid[i] = 1
          s.cleared++
        }
      }
    }
  }

  /** Scrapes from a to b: a round stroke, bites out of its rim, and a few specks of foil left behind. */
  function scrape(a: Pt, b: Pt, brush: number) {
    const { seed, pal } = get()
    const rnd = mulberry32(seed * 977 + s.seg++)
    const r = brush / 2
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy)

    ctx.globalCompositeOperation = "destination-out"
    ctx.globalAlpha = 1
    ctx.fillStyle = "#000"
    ctx.strokeStyle = "#000"
    if (len < 0.5) {
      ctx.beginPath()
      ctx.arc(a.x, a.y, r, 0, Math.PI * 2)
      ctx.fill()
    } else {
      ctx.lineWidth = brush
      ctx.lineCap = "round"
      ctx.beginPath()
      ctx.moveTo(a.x, a.y)
      ctx.lineTo(b.x, b.y)
      ctx.stroke()
    }

    // Ragged rim: small bites just outside the stroke, and around its head.
    const nx = len ? -dy / len : 0
    const ny = len ? dx / len : 1
    const bites = 2 + Math.floor(len / 2.4)
    ctx.beginPath()
    for (let i = 0; i < bites; i++) {
      const t = rnd()
      const side = rnd() < 0.5 ? -1 : 1
      const off = r + rnd() * 2.8 - 0.8
      const x = a.x + dx * t + nx * side * off
      const y = a.y + dy * t + ny * side * off
      const br = 0.5 + rnd() * 1.7
      ctx.moveTo(x + br, y)
      ctx.arc(x, y, br, 0, Math.PI * 2)
    }
    for (let i = 0; i < 3; i++) {
      const ang = rnd() * Math.PI * 2
      const x = b.x + Math.cos(ang) * (r + rnd() * 1.5)
      const y = b.y + Math.sin(ang) * (r + rnd() * 1.5)
      const br = 0.6 + rnd() * 1.4
      ctx.moveTo(x + br, y)
      ctx.arc(x, y, br, 0, Math.PI * 2)
    }
    ctx.fill()

    // Residue: real foil never comes off clean.
    ctx.globalCompositeOperation = "source-over"
    ctx.fillStyle = pal.dark
    for (let i = 0, n = Math.floor(len / 10) + (rnd() < 0.3 ? 1 : 0); i < n; i++) {
      const t = rnd()
      const off = (rnd() * 2 - 1) * r * 0.8
      ctx.globalAlpha = 0.35 + rnd() * 0.35
      const sz = 0.6 + rnd() * 1
      ctx.fillRect(a.x + dx * t + nx * off, a.y + dy * t + ny * off, sz, sz)
    }
    ctx.globalAlpha = 1

    markGrid(a, b, r)
  }

  function spawnFlakes(a: Pt, b: Pt, brush: number) {
    if (!get().flakes || reduced()) return
    const { pal } = get()
    const dx = b.x - a.x
    const dy = b.y - a.y
    const len = Math.hypot(dx, dy)
    if (!len) return
    const n = Math.min(4, Math.floor(len / 7) + (Math.random() < 0.45 ? 1 : 0))
    const colors = [pal.light, pal.mid, pal.mid, pal.dark]
    for (let i = 0; i < n; i++) {
      const t = Math.random()
      const side = Math.random() < 0.5 ? -1 : 1
      const off = (brush / 2) * (0.4 + Math.random() * 0.6) * side
      s.flakes.push({
        x: a.x + dx * t + (-dy / len) * off + SPILL.x,
        y: a.y + dy * t + (dx / len) * off + SPILL.top,
        vx: (dx / len) * (40 + Math.random() * 90) + (Math.random() - 0.5) * 120,
        vy: -60 - Math.random() * 140,
        r: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 14,
        flip: Math.random() * Math.PI,
        vflip: 8 + Math.random() * 14,
        size: 1.6 + Math.random() * 2.6,
        color: colors[Math.floor(Math.random() * colors.length)],
        age: 0,
        life: 0.5 + Math.random() * 0.45,
      })
    }
    if (s.flakes.length > MAX_FLAKES) s.flakes.splice(0, s.flakes.length - MAX_FLAKES)
    kick()
  }

  function frame(now: number) {
    s.raf = 0
    const dt = Math.min(0.05, (now - (s.prev || now)) / 1000)
    s.prev = now
    dctx.clearRect(0, 0, s.w + SPILL.x * 2, s.h + SPILL.top + SPILL.bottom)
    s.flakes = s.flakes.filter((f) => (f.age += dt) < f.life)
    for (const f of s.flakes) {
      f.vy += GRAVITY * dt
      f.vx *= 1 - 1.5 * dt
      f.x += f.vx * dt
      f.y += f.vy * dt
      f.r += f.vr * dt
      f.flip += f.vflip * dt
      const k = f.age / f.life
      dctx.globalAlpha = k < 0.6 ? 1 : 1 - (k - 0.6) / 0.4
      dctx.fillStyle = f.color
      dctx.save()
      dctx.translate(f.x, f.y)
      dctx.rotate(f.r)
      // Tumbling: squash one axis as the flake turns edge-on.
      dctx.scale(1, Math.max(0.15, Math.abs(Math.cos(f.flip))))
      dctx.fillRect(-f.size / 2, -f.size * 0.35, f.size, f.size * 0.7)
      dctx.restore()
    }
    dctx.globalAlpha = 1
    if (s.flakes.length) kick()
    else s.prev = 0
  }

  function kick() {
    if (!s.raf) s.raf = requestAnimationFrame(frame)
  }

  function report() {
    const total = s.cols * s.rows
    if (!total) return
    const p = s.cleared / total
    if (Math.abs(p - s.reported) >= 0.01 || p === 1) {
      s.reported = p
      get().onProgress(p)
    }
    if (!s.done && p >= get().threshold) {
      s.done = true
      s.pointer = null
      s.stroke = null
      get().onComplete()
    }
  }

  function local(e: PointerEvent): Pt {
    const rect = s.rect ?? host.getBoundingClientRect()
    // Measured against layout size, so a scaled parent still maps cleanly.
    return {
      x: ((e.clientX - rect.left) / rect.width) * s.w,
      y: ((e.clientY - rect.top) / rect.height) * s.h,
    }
  }

  function repaint() {
    if (!s.w || !s.h) return
    const { pal, seed, label } = get()
    paintFoil(ctx, s.w, s.h, pal, seed, label, getComputedStyle(host).fontFamily || "sans-serif")
    s.cols = Math.ceil(s.w / CELL)
    s.rows = Math.ceil(s.h / CELL)
    s.grid = new Uint8Array(s.cols * s.rows)
    s.cleared = 0
    s.seg = 0
    for (const st of s.strokes) {
      const pts = st.pts.map((p) => ({ x: p.x * s.w, y: p.y * s.h }))
      scrape(pts[0], pts[0], st.brush)
      for (let i = 1; i < pts.length; i++) scrape(pts[i - 1], pts[i], st.brush)
    }
  }

  return {
    resize() {
      const w = host.clientWidth
      const h = host.clientHeight
      if (!w || !h) return false
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      s.w = w
      s.h = h
      canvas.width = Math.round(w * dpr)
      canvas.height = Math.round(h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      dust.width = Math.round((w + SPILL.x * 2) * dpr)
      dust.height = Math.round((h + SPILL.top + SPILL.bottom) * dpr)
      dctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      repaint()
      return true
    },
    repaint,
    down(e: PointerEvent, target: HTMLElement) {
      if (s.done || s.pointer !== null) return
      if (e.pointerType === "mouse" && e.button !== 0) return
      s.pointer = e.pointerId
      target.setPointerCapture(e.pointerId)
      s.rect = host.getBoundingClientRect()
      const p = local(e)
      const { brush } = get()
      s.stroke = { brush, pts: [{ x: p.x / s.w, y: p.y / s.h }] }
      s.strokes.push(s.stroke)
      s.last = p
      if (!s.started) {
        s.started = true
        get().onStart()
      }
      scrape(p, p, brush)
      report()
    },
    move(e: PointerEvent) {
      if (e.pointerId !== s.pointer || !s.stroke || !s.last) return
      const events = e.getCoalescedEvents?.() ?? []
      for (const ev of events.length ? events : [e]) {
        const p = local(ev)
        if (Math.hypot(p.x - s.last.x, p.y - s.last.y) < 1.5) continue
        scrape(s.last, p, s.stroke.brush)
        spawnFlakes(s.last, p, s.stroke.brush)
        s.stroke.pts.push({ x: p.x / s.w, y: p.y / s.h })
        s.last = p
      }
      report()
    },
    up(e: PointerEvent) {
      if (e.pointerId !== s.pointer) return
      s.pointer = null
      s.stroke = null
      s.last = null
      s.rect = null
    },
    /** Marks the card revealed without scratching, e.g. from the keyboard or a controlled prop. */
    finish() {
      s.done = true
      s.pointer = null
      s.stroke = null
    },
    reset() {
      if (!s.done && !s.strokes.length) return
      s.done = false
      s.started = false
      s.strokes = []
      s.flakes = []
      s.reported = -1
      repaint()
      get().onProgress(0)
    },
    destroy() {
      cancelAnimationFrame(s.raf)
    },
  }
}

type Engine = ReturnType<typeof createScratch>

export interface ScratchCardProps extends Omit<React.ComponentProps<"div">, "children" | "onProgress"> {
  /** What sits under the foil. */
  children: React.ReactNode
  /** A named foil or any `#rrggbb` hex. */
  foil?: ScratchCardFoil | (string & {})
  /** Width of the scratch, in px. */
  brushSize?: number
  /** Share of foil, 0 to 1, that has to be scratched before the rest falls away. */
  threshold?: number
  /** Controlled revealed state. Set it back to `false` to lay fresh foil. */
  revealed?: boolean
  defaultRevealed?: boolean
  onRevealedChange?: (revealed: boolean) => void
  /** Called once when the card is revealed by scratching or the keyboard. */
  onReveal?: () => void
  /** Called as the foil comes off, with the scratched share from 0 to 1. */
  onProgress?: (progress: number) => void
  /** Text pressed into the foil. */
  foilLabel?: string
  /** Accessible name of the foil. */
  label?: string
  /** Instructions read by screen readers. */
  hint?: string
  /** Announced once revealed. */
  revealedLabel?: string
  /** Shed flakes of foil while scratching. */
  flakes?: boolean
  /** Buzz the device on reveal where the Vibration API exists. */
  haptics?: boolean
  /** Seed for the foil's grain and the scratch's ragged edge. */
  seed?: number
}

export function ScratchCard({
  children,
  foil = "silver",
  brushSize = 28,
  threshold = 0.6,
  revealed: revealedProp,
  defaultRevealed = false,
  onRevealedChange,
  onReveal,
  onProgress,
  foilLabel = "",
  label = "Scratch to reveal",
  hint = "Drag across the foil to scratch it off, or press Enter to reveal",
  revealedLabel = "Revealed",
  flakes = true,
  haptics = true,
  seed = 3,
  className,
  style,
  ...props
}: ScratchCardProps) {
  const hostRef = React.useRef<HTMLDivElement>(null)
  const foilRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const dustRef = React.useRef<HTMLCanvasElement>(null)
  const prizeRef = React.useRef<HTMLDivElement>(null)
  const engineRef = React.useRef<Engine | null>(null)
  const hintId = React.useId()

  const [inner, setInner] = React.useState(defaultRevealed)
  const revealed = revealedProp ?? inner
  const [painted, setPainted] = React.useState(false)
  const [touched, setTouched] = React.useState(false)
  const pal = paletteOf(foil)

  const handFocus = React.useRef(false)

  const reveal = () => {
    if (revealed) return
    handFocus.current = document.activeElement === foilRef.current
    if (revealedProp === undefined) setInner(true)
    onRevealedChange?.(true)
    onReveal?.()
    if (haptics) navigator.vibrate?.(12)
  }

  const options = React.useRef<Options>(null!)
  options.current = {
    brush: brushSize,
    threshold,
    seed,
    pal,
    label: foilLabel,
    flakes,
    onStart: () => setTouched(true),
    onProgress: (p) => onProgress?.(p),
    onComplete: reveal,
  }

  React.useEffect(() => {
    const host = hostRef.current!
    const engine = createScratch(host, canvasRef.current!, dustRef.current!, () => options.current)
    engineRef.current = engine
    if (engine.resize()) setPainted(true)
    const ro = new ResizeObserver(() => {
      if (engine.resize()) setPainted(true)
    })
    ro.observe(host)
    return () => {
      ro.disconnect()
      engine.destroy()
      engineRef.current = null
    }
  }, [])

  React.useEffect(() => {
    const engine = engineRef.current
    if (!engine) return
    if (revealed) {
      engine.finish()
      // The foil goes invisible, so hand focus to what was under it.
      if (handFocus.current) prizeRef.current?.focus({ preventScroll: true })
      handFocus.current = false
    } else {
      engine.reset()
      setTouched(false)
    }
  }, [revealed])

  React.useEffect(() => {
    engineRef.current?.repaint()
  }, [pal.light, pal.mid, pal.dark, seed, foilLabel])

  const r = brushSize / 2
  const ring = Math.min(r, 30)
  const cursor = `url("data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='${ring * 2 + 4}' height='${ring * 2 + 4}'>` +
      `<circle cx='${ring + 2}' cy='${ring + 2}' r='${ring}' fill='none' stroke='black' stroke-opacity='.45' stroke-width='3'/>` +
      `<circle cx='${ring + 2}' cy='${ring + 2}' r='${ring}' fill='none' stroke='white' stroke-width='1.25'/>` +
      `</svg>`
  )}") ${ring + 2} ${ring + 2}, crosshair`

  return (
    <div
      ref={hostRef}
      data-revealed={revealed || undefined}
      className={cn("relative isolate", className)}
      style={style}
      {...props}
    >
      <div
        ref={prizeRef}
        tabIndex={-1}
        inert={!revealed}
        aria-hidden={!revealed}
        className="size-full rounded-[inherit] outline-none"
      >
        {children}
      </div>

      <div
        ref={foilRef}
        role="button"
        tabIndex={revealed ? -1 : 0}
        aria-label={label}
        aria-describedby={hintId}
        aria-hidden={revealed || undefined}
        className={cn(
          "group/scratch absolute inset-0 touch-none overflow-hidden rounded-[inherit] outline-none select-none",
          "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          "transition-[opacity,visibility]",
          revealed && "pointer-events-none invisible opacity-0"
        )}
        style={{
          cursor,
          transitionDuration: revealed ? "420ms" : "200ms",
          transitionTimingFunction: EASE_OUT,
        }}
        onPointerDown={(e) => engineRef.current?.down(e.nativeEvent, e.currentTarget)}
        onPointerMove={(e) => engineRef.current?.move(e.nativeEvent)}
        onPointerUp={(e) => engineRef.current?.up(e.nativeEvent)}
        onPointerCancel={(e) => engineRef.current?.up(e.nativeEvent)}
        onLostPointerCapture={(e) => engineRef.current?.up(e.nativeEvent)}
        onKeyDown={(e) => {
          if (e.repeat || (e.key !== "Enter" && e.key !== " ")) return
          e.preventDefault()
          engineRef.current?.finish()
          reveal()
        }}
      >
        <canvas ref={canvasRef} aria-hidden className="absolute inset-0 size-full" />
        {/* Solid foil until the canvas has painted, so the prize never flashes on load. */}
        {!painted && <div aria-hidden className="absolute inset-0" style={{ background: pal.mid }} />}
        {/* A single sheen across untouched foil on hover, inviting the first scratch. */}
        {!touched && (
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden motion-reduce:hidden">
            <div className="absolute inset-y-0 -left-1/2 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent transition-none group-hover/scratch:translate-x-[320%] group-hover/scratch:transition-transform group-hover/scratch:duration-[900ms] group-hover/scratch:ease-[cubic-bezier(0.23,1,0.32,1)]" />
          </div>
        )}
      </div>

      <canvas
        ref={dustRef}
        aria-hidden
        className="pointer-events-none absolute z-10"
        style={{
          left: -SPILL.x,
          top: -SPILL.top,
          width: `calc(100% + ${SPILL.x * 2}px)`,
          height: `calc(100% + ${SPILL.top + SPILL.bottom}px)`,
        }}
      />

      <span id={hintId} className="sr-only">
        {hint}
      </span>
      <span aria-live="polite" className="sr-only">
        {revealed ? revealedLabel : ""}
      </span>
    </div>
  )
}
