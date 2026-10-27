"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

/*
 * Canvas, not SVG. A plate is a few hundred hatch lines of a few hundred samples each, and every line
 * swells and thins along its length. SVG can only do that with a filled outline per line or a path per
 * segment: tens of thousands of nodes to lay out, style and keep in the DOM, and stroke-dashoffset does
 * not work on filled outlines anyway. Ink only ever adds, so the canvas draws just the newly cut stretch
 * of each line every frame, and over the whole animation each segment is drawn exactly once.
 */

type Source = HTMLImageElement | HTMLCanvasElement | ImageBitmap

/** One cut: x, y, width triplets in CSS px, plus when it starts and how long it takes, as fractions of the run. */
type Line = { pts: Float32Array; start: number; dur: number }

/** A tone map on a coarse grid. `k` is CSS px per cell. */
type Grid = { data: Float32Array; w: number; h: number; k: number }

/** The three passes of the burin. Cross-hatching only enters the darker tones, the third pass only the deepest. */
const PASSES = [
  // A hairline survives in the lights; only the brightest highlights are left as bare paper.
  { turn: 0, from: 0, to: 0.62, weight: (t: number) => (t < 0.035 ? 0 : 0.1 + 0.8 * t) },
  { turn: 62, from: 0.34, to: 0.88, weight: (t: number) => 0.7 * Math.max(0, (t - 0.48) / 0.52) },
  { turn: -48, from: 0.6, to: 1, weight: (t: number) => 0.55 * Math.max(0, (t - 0.74) / 0.26) },
]

/** Thinner than this and the burin is lifted. */
const MIN_WIDTH = 0.3

function prng(seed: number) {
  let a = seed >>> 0 || 1
  return () => {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

function sourceSize(image: Source): [number, number] {
  if ("naturalWidth" in image && image.naturalWidth) return [image.naturalWidth, image.naturalHeight]
  return [image.width, image.height]
}

/** Separable box blur, in place. Two passes are close enough to a Gaussian for a tone map. */
function boxBlur(src: Float32Array, w: number, h: number, r: number) {
  if (r < 1) return src
  const tmp = new Float32Array(src.length)
  const span = r * 2 + 1
  for (let pass = 0; pass < 2; pass++) {
    for (let y = 0; y < h; y++) {
      let acc = 0
      for (let x = -r; x <= r; x++) acc += src[y * w + Math.min(w - 1, Math.max(0, x))]
      for (let x = 0; x < w; x++) {
        tmp[y * w + x] = acc / span
        acc += src[y * w + Math.min(w - 1, x + r + 1)] - src[y * w + Math.max(0, x - r)]
      }
    }
    for (let x = 0; x < w; x++) {
      let acc = 0
      for (let y = -r; y <= r; y++) acc += tmp[Math.min(h - 1, Math.max(0, y)) * w + x]
      for (let y = 0; y < h; y++) {
        src[y * w + x] = acc / span
        acc += tmp[Math.min(h - 1, y + r + 1) * w + x] - tmp[Math.max(0, y - r) * w + x]
      }
    }
  }
  return src
}

/** Reads the image as darkness, 0 for paper to 1 for full ink. Throws if a cross-origin image has no CORS headers. */
function readTone(image: Source, width: number, height: number, fit: "cover" | "contain"): [Grid, Grid] {
  const k = 2
  const w = Math.max(1, Math.ceil(width / k))
  const h = Math.max(1, Math.ceil(height / k))
  const off = document.createElement("canvas")
  off.width = w
  off.height = h
  const ctx = off.getContext("2d", { willReadFrequently: true })
  if (!ctx) throw new Error("No 2D context")
  const [iw, ih] = sourceSize(image)
  const scale = fit === "cover" ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih)
  ctx.imageSmoothingQuality = "high"
  ctx.drawImage(image, (w - iw * scale) / 2, (h - ih * scale) / 2, iw * scale, ih * scale)
  const px = ctx.getImageData(0, 0, w, h).data
  const tone = new Float32Array(w * h)
  const histogram = new Uint32Array(256)
  for (let i = 0; i < tone.length; i++) {
    const lum = (0.2126 * px[i * 4] + 0.7152 * px[i * 4 + 1] + 0.0722 * px[i * 4 + 2]) / 255
    tone[i] = 1 - lum
    if (px[i * 4 + 3] > 127) histogram[Math.round(tone[i] * 255)]++
  }
  // Auto levels: stretch the 2nd to 98th percentile to the full range, so a grey photo still gets bare
  // paper in its lights and solid ink in its darks.
  const total = histogram.reduce((a, b) => a + b, 0)
  let lo = 0
  let hi = 255
  for (let n = 0; n < total * 0.02 && lo < 255; lo++) n += histogram[lo]
  for (let n = 0; n < total * 0.02 && hi > 0; hi--) n += histogram[hi]
  const range = Math.max(0.1, (hi - lo) / 255)
  for (let i = 0; i < tone.length; i++) {
    // Then lift the mid-tones: an engraver leaves them to a single open hatch and saves the crossing for shadow.
    tone[i] = clamp01((tone[i] - lo / 255) / range) ** 1.2 * (px[i * 4 + 3] / 255)
  }
  const soft = boxBlur(Float32Array.from(tone), w, h, Math.max(2, Math.round(Math.min(w, h) / 40)))
  return [
    { data: boxBlur(tone, w, h, 1), w, h, k },
    { data: soft, w, h, k },
  ]
}

function sample(g: Grid, x: number, y: number) {
  const gx = Math.min(g.w - 1.001, Math.max(0, x / g.k - 0.5))
  const gy = Math.min(g.h - 1.001, Math.max(0, y / g.k - 0.5))
  const x0 = gx | 0
  const y0 = gy | 0
  const fx = gx - x0
  const fy = gy - y0
  const i = y0 * g.w + x0
  const top = g.data[i] + (g.data[i + 1] - g.data[i]) * fx
  const bottom = g.data[i + g.w] + (g.data[i + g.w + 1] - g.data[i + g.w]) * fx
  return top + (bottom - top) * fy
}

/**
 * Lays out every hatch line. Each runs at the pass angle, bows in a gentle arc, and swerves with the
 * blurred tone so the hatching wraps the forms the way an engraver's lines follow a cheek or a fold.
 */
function cutPlate(
  tone: Grid,
  soft: Grid,
  width: number,
  height: number,
  { spacing, angle, curve, layers, seed }: { spacing: number; angle: number; curve: number; layers: number; seed: number }
) {
  const rand = prng(seed)
  const lines: Line[] = []
  const sp = Math.max(2, spacing)
  const cx = width / 2
  const cy = height / 2
  const reach = Math.hypot(width, height) / 2 + sp * 2
  const step = Math.min(3, Math.max(1.5, sp * 0.5))
  const c = clamp01(curve)

  PASSES.slice(0, Math.min(3, Math.max(1, Math.round(layers)))).forEach((pass, index) => {
    const a = ((angle + pass.turn) * Math.PI) / 180
    const dx = Math.cos(a)
    const dy = Math.sin(a)
    const bow = (index % 2 ? -1 : 1) * c * reach * 0.12
    const runs: Float32Array[] = []

    for (let v = -reach + (index * sp) / 3; v <= reach; v += sp) {
      let run: number[] = []
      let inked = false
      const phase = rand() * 100
      const flush = () => {
        if (inked && run.length >= 12) runs.push(Float32Array.from(run))
        run = []
        inked = false
      }
      for (let u = -reach; u <= reach; u += step) {
        const s = u / reach
        let x = cx + dx * u - dy * v
        let y = cy + dy * u + dx * v
        // Bow, contour swerve, and a slight tremor of the hand.
        const shift =
          bow * (s * s - 0.35) + c * sp * 2.4 * (sample(soft, x, y) - 0.5) + Math.sin(u * 0.03 + phase) * sp * 0.06
        x -= dy * shift
        y += dx * shift
        if (x < -sp || y < -sp || x > width + sp || y > height + sp) {
          flush()
          continue
        }
        const pressure = 0.9 + 0.2 * (0.5 + 0.5 * Math.sin(u * 0.045 + phase * 1.7))
        const w = sp * pass.weight(sample(tone, x, y)) * pressure
        if (w >= MIN_WIDTH) inked = true
        run.push(x, y, w)
      }
      flush()
    }

    // Cut in order across the plate, each line overlapping the next few, with a little irregularity.
    const span = pass.to - pass.from
    runs.forEach((pts, i) => {
      const dur = span * (0.3 + rand() * 0.12)
      const at = runs.length > 1 ? i / (runs.length - 1) : 0
      const start = Math.max(0, pass.from + at * (span - dur) + (rand() - 0.5) * 0.05)
      lines.push({ pts, start, dur: Math.min(dur, 1 - start) })
    })
  })
  return lines
}

/** How far along a line the burin is at plate time `p`. Each stroke eases out as the cut finishes. */
function along(line: Line, p: number) {
  const x = clamp01((p - line.start) / line.dur)
  return 1 - (1 - x) * (1 - x)
}

/**
 * Inks everything cut between plate times `p0` and `p1`. Segments are filled as overlapping quads in
 * one path, so they union cleanly with no seams where the width changes.
 */
function engrave(ctx: CanvasRenderingContext2D, lines: Line[], p0: number, p1: number) {
  let quads = 0
  ctx.beginPath()
  for (const line of lines) {
    const a = along(line, p0)
    const b = along(line, p1)
    if (b <= a) continue
    const pts = line.pts
    const last = pts.length / 3 - 1
    const end = Math.floor(b * last)
    for (let j = Math.floor(a * last); j < end; j++) {
      const i = j * 3
      const w0 = pts[i + 2]
      const w1 = pts[i + 5]
      if (w0 < MIN_WIDTH && w1 < MIN_WIDTH) continue
      const x0 = pts[i]
      const y0 = pts[i + 1]
      const x1 = pts[i + 3]
      const y1 = pts[i + 4]
      const len = Math.hypot(x1 - x0, y1 - y0) || 1
      // Overshoot each end a touch so neighbouring quads, even from different frames, overlap.
      const ux = ((x1 - x0) / len) * 0.35
      const uy = ((y1 - y0) / len) * 0.35
      const nx = -(y1 - y0) / len
      const ny = (x1 - x0) / len
      const h0 = w0 / 2
      const h1 = w1 / 2
      ctx.moveTo(x0 - ux + nx * h0, y0 - uy + ny * h0)
      ctx.lineTo(x1 + ux + nx * h1, y1 + uy + ny * h1)
      ctx.lineTo(x1 + ux - nx * h1, y1 + uy - ny * h1)
      ctx.lineTo(x0 - ux - nx * h0, y0 - uy - ny * h0)
      ctx.closePath()
      // Very long paths get slow to rasterise; flush in batches.
      if (++quads % 4000 === 0) {
        ctx.fill()
        ctx.beginPath()
      }
    }
  }
  ctx.fill()
}

/** Paper, then plate tone: the thin film of ink left after wiping, heavier toward the edges, and a little grain. */
function prepare(ctx: CanvasRenderingContext2D, width: number, height: number, ink: string, paper: string, seed: number) {
  ctx.clearRect(0, 0, width, height)
  if (paper === "transparent") return
  ctx.fillStyle = paper
  ctx.fillRect(0, 0, width, height)
  ctx.fillStyle = ink
  const tone = ctx.createRadialGradient(width / 2, height / 2, Math.min(width, height) * 0.25, width / 2, height / 2, Math.hypot(width, height) / 2)
  tone.addColorStop(0, "rgba(0,0,0,0)")
  tone.addColorStop(1, ink)
  ctx.globalAlpha = 0.07
  ctx.fillStyle = tone
  ctx.fillRect(0, 0, width, height)
  const rand = prng(seed + 17)
  ctx.fillStyle = ink
  for (const alpha of [0.05, 0.09, 0.14]) {
    ctx.globalAlpha = alpha
    for (let n = (width * height) / 260; n > 0; n--) {
      const s = 0.4 + rand() * 0.7
      ctx.fillRect(rand() * width, rand() * height, s, s)
    }
  }
  ctx.globalAlpha = 1
}

const reducedQuery = "(prefers-reduced-motion: reduce)"
function subscribeReduced(onChange: () => void) {
  const mq = window.matchMedia(reducedQuery)
  mq.addEventListener("change", onChange)
  return () => mq.removeEventListener("change", onChange)
}
function useReducedMotion() {
  return React.useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(reducedQuery).matches,
    () => false
  )
}

export interface EtchingProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Image URL. Cross-origin images must be served with CORS headers, or the canvas cannot read them. */
  src: string
  /** Accessible description. Leave empty for decorative images. */
  alt?: string
  /** Gap between hatch lines in CSS px. Smaller is finer and slower to cut. Default 4. */
  lineSpacing?: number
  /** Angle of the first pass of lines, in degrees. Default 35. */
  angle?: number
  /** How much the lines bow and swerve around the forms, 0 to 1. 0 is ruled straight. Default 0.5. */
  curve?: number
  /** Passes of the burin: 1 hatches, 2 adds cross-hatching in the darks, 3 a third pass in the deepest shadows. Default 3. */
  layers?: 1 | 2 | 3
  /** Ink colour. Any CSS colour, or "currentColor". Default "#241d17". */
  ink?: string
  /** Paper colour, or "transparent". Default "#f4f1ea". */
  paper?: string
  /** Engrave the lines in the first time it scrolls into view. Default true. */
  draw?: boolean
  /** Length of the engraving in ms. Default 2600. */
  duration?: number
  /** Controlled progress, 0 to 1. When set, it replaces the scroll-in animation. */
  progress?: number
  /** How the image fills the plate. Default "cover". */
  fit?: "cover" | "contain"
  /** Seed for the hand tremor and stroke order. Default 5. */
  seed?: number
  /** Default "anonymous". Pass undefined for same-origin images that must not send a CORS request. */
  crossOrigin?: "anonymous" | "use-credentials"
  /** Content layered over the plate (captions, badges). */
  children?: React.ReactNode
}

/**
 * An image as a copperplate engraving: hatch lines that swell with the shadows, cross-hatching in
 * the darks, ink on paper with plate tone. The lines cut themselves in when it scrolls into view.
 */
export function Etching({
  src,
  alt = "",
  lineSpacing = 4,
  angle = 35,
  curve = 0.5,
  layers = 3,
  ink = "#241d17",
  paper = "#f4f1ea",
  draw = true,
  duration = 2600,
  progress,
  fit = "cover",
  seed = 5,
  crossOrigin = "anonymous",
  className,
  style,
  children,
  ...props
}: EtchingProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [image, setImage] = React.useState<HTMLImageElement | null>(null)
  const [ratio, setRatio] = React.useState<number | undefined>(undefined)
  const reduced = useReducedMotion()
  const controlled = progress !== undefined

  const progressRef = React.useRef(progress ?? 0)
  const paintRef = React.useRef<(() => void) | undefined>(undefined)
  // Survives re-renders and option changes, so changing line spacing after the run does not replay it.
  const clockRef = React.useRef({ elapsed: 0, done: false })

  React.useEffect(() => {
    let cancelled = false
    const img = new Image()
    if (crossOrigin) img.crossOrigin = crossOrigin
    img.decoding = "async"
    img.onload = () => {
      if (cancelled) return
      setImage(img)
      setRatio(img.naturalWidth / img.naturalHeight)
    }
    img.onerror = () => {
      if (!cancelled) setImage(null)
    }
    img.src = src
    return () => {
      cancelled = true
    }
  }, [src, crossOrigin])

  React.useEffect(() => {
    const el = ref.current
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!el || !canvas || !ctx || !image) return

    const clock = clockRef.current
    const animate = draw && !reduced && !controlled
    let lines: Line[] = []
    let ready = false
    let drawn = 0
    let width = 0
    let height = 0
    let colors = { ink, paper }
    let raf = 0
    let build = 0
    let last = 0
    let visible = false
    let seen = false

    const target = () => {
      if (controlled) return clamp01(progressRef.current)
      if (!animate || clock.done) return 1
      // A soft ease-out: brisk at first, still cutting near the end, never a mechanical constant rate.
      return 1 - (1 - clamp01(clock.elapsed / duration)) ** 1.4
    }

    const reset = () => {
      prepare(ctx, width, height, colors.ink, colors.paper, seed)
      ctx.fillStyle = colors.ink
      drawn = 0
    }

    const paint = () => {
      if (!ready) return
      const p = target()
      if (p < drawn) reset()
      if (p > drawn) {
        engrave(ctx, lines, drawn, p)
        drawn = p
      }
    }

    const rebuild = () => {
      const rect = el.getBoundingClientRect()
      if (!rect.width || !rect.height) return
      width = rect.width
      height = rect.height
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const style = getComputedStyle(el)
      colors = {
        ink: ink === "currentColor" ? style.color : ink,
        paper: paper === "currentColor" ? style.color : paper,
      }
      try {
        const [tone, soft] = readTone(image, width, height, fit)
        lines = cutPlate(tone, soft, width, height, { spacing: lineSpacing, angle, curve, layers, seed })
      } catch (error) {
        console.warn("Etching: could not read the image pixels. Serve it from the same origin or with CORS headers.", error)
        return
      }
      ready = true
      reset()
      paint()
    }

    const tick = (now: number) => {
      clock.elapsed += Math.min(64, now - last)
      last = now
      if (clock.elapsed >= duration) clock.done = true
      paint()
      raf = clock.done ? 0 : requestAnimationFrame(tick)
    }
    const play = () => {
      if (!animate || clock.done || raf || !seen || !visible || document.hidden) return
      last = performance.now()
      raf = requestAnimationFrame(tick)
    }
    const pause = () => {
      cancelAnimationFrame(raf)
      raf = 0
    }

    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(build)
      build = requestAnimationFrame(rebuild)
    })
    ro.observe(el)
    // Starts once a good part of the plate is on screen; pauses whenever it leaves.
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (entry.intersectionRatio >= 0.35) seen = true
        if (visible) play()
        else pause()
      },
      { threshold: [0, 0.35] }
    )
    io.observe(el)
    const onVisibility = () => (document.hidden ? pause() : play())
    document.addEventListener("visibilitychange", onVisibility)
    // Re-ink when the theme flips and a colour is inherited.
    const mo =
      ink === "currentColor" || paper === "currentColor"
        ? new MutationObserver(() => {
            cancelAnimationFrame(build)
            build = requestAnimationFrame(rebuild)
          })
        : null
    mo?.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
    paintRef.current = paint

    return () => {
      pause()
      cancelAnimationFrame(build)
      ro.disconnect()
      io.disconnect()
      mo?.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      paintRef.current = undefined
    }
  }, [image, lineSpacing, angle, curve, layers, ink, paper, draw, duration, fit, seed, reduced, controlled])

  React.useEffect(() => {
    progressRef.current = progress ?? 0
    paintRef.current?.()
  }, [progress])

  return (
    <div
      ref={ref}
      data-slot="etching"
      // The image's own ratio is only a fallback class, so an aspect-* class or a height wins.
      className={cn("relative aspect-(--etching-ratio) overflow-hidden", className)}
      style={{ "--etching-ratio": ratio, backgroundColor: paper, ...style } as React.CSSProperties}
      {...props}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 size-full"
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
      />
      {children}
    </div>
  )
}
