"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type DitherMatrix = 2 | 4 | 8

export interface DitherOptions {
  /** Size of one dither pixel in CSS pixels, 1 to 16. Default 4. */
  dotSize?: number
  /** Bayer matrix order. 8 gives the smoothest tones, 2 the harshest. Default 8. */
  matrix?: DitherMatrix
  /** Ink for dark pixels. Any CSS colour, including `currentColor`. Default "#000". */
  dark?: string
  /** Ink for light pixels. Any CSS colour, or "transparent" to let the layer below show. Default "#fff". */
  light?: string
  /** Tone curve steepness, roughly 0.5 to 2. Default 1. */
  contrast?: number
  /** Shift the tones lighter (positive) or darker (negative), -1 to 1. Default 0. */
  brightness?: number
  /** How the source fills the canvas. Default "cover". */
  fit?: "cover" | "contain"
}

type Source = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap

const BAYER_2 = [0, 2, 3, 1]
const BAYER_4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5]
const BAYER_8 = [
  0, 32, 8, 40, 2, 34, 10, 42, 48, 16, 56, 24, 50, 18, 58, 26, 12, 44, 4, 36, 14, 46, 6, 38, 60, 28, 52, 20, 62, 30, 54,
  22, 3, 35, 11, 43, 1, 33, 9, 41, 51, 19, 59, 27, 49, 17, 57, 25, 15, 47, 7, 39, 13, 45, 5, 37, 63, 31, 55, 23, 61, 29,
  53, 21,
]

function bayer(order: DitherMatrix) {
  const m = order === 2 ? BAYER_2 : order === 4 ? BAYER_4 : BAYER_8
  const n = order * order
  return { m: m.map((v) => (v + 0.5) / n), size: order }
}

function sourceSize(image: Source): [number, number] {
  if ("naturalWidth" in image && image.naturalWidth) return [image.naturalWidth, image.naturalHeight]
  if ("videoWidth" in image && image.videoWidth) return [image.videoWidth, image.videoHeight]
  return [image.width, image.height]
}

function parseColor(color: string, el?: Element | null): [number, number, number, number] {
  if (color === "transparent") return [0, 0, 0, 0]
  if (typeof document === "undefined") return [0, 0, 0, 255]
  const probe = document.createElement("canvas")
  probe.width = probe.height = 1
  const ctx = probe.getContext("2d")
  if (!ctx) return [0, 0, 0, 255]
  let value = color
  if (color === "currentColor") value = el ? getComputedStyle(el).color : "#000"
  ctx.fillStyle = value
  ctx.fillRect(0, 0, 1, 1)
  const d = ctx.getImageData(0, 0, 1, 1).data
  return [d[0], d[1], d[2], d[3]]
}

function drawCover(ctx: CanvasRenderingContext2D, image: Source, w: number, h: number, fit: "cover" | "contain") {
  const [iw, ih] = sourceSize(image)
  if (!iw || !ih) return false
  const scale = fit === "cover" ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih)
  const dw = iw * scale
  const dh = ih * scale
  ctx.drawImage(image, (w - dw) / 2, (h - dh) / 2, dw, dh)
  return true
}

/**
 * Ordered (Bayer) dither of `image` at one sample per dither pixel.
 * Returns a bitmap of 0 (dark) / 1 (light) and its size in dither pixels.
 */
export function ditherBitmap(image: Source, width: number, height: number, options: DitherOptions = {}) {
  const { dotSize = 4, matrix = 8, contrast = 1, brightness = 0, fit = "cover" } = options
  const cell = Math.max(1, dotSize)
  const bw = Math.max(1, Math.ceil(width / cell))
  const bh = Math.max(1, Math.ceil(height / cell))
  const off = document.createElement("canvas")
  off.width = bw
  off.height = bh
  const octx = off.getContext("2d", { willReadFrequently: true })
  const bits = new Uint8Array(bw * bh)
  if (!octx || !drawCover(octx, image, bw, bh, fit)) return { bits, bw, bh, cell }
  const data = octx.getImageData(0, 0, bw, bh).data
  const { m, size } = bayer(matrix)
  for (let y = 0; y < bh; y++) {
    for (let x = 0; x < bw; x++) {
      const i = (y * bw + x) * 4
      const a = data[i + 3] / 255
      let lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
      lum = lum * a + (1 - a) // transparent reads as paper
      lum = (lum - 0.5) * contrast + 0.5 + brightness
      bits[y * bw + x] = lum > m[(y % size) * size + (x % size)] ? 1 : 0
    }
  }
  return { bits, bw, bh, cell }
}

/**
 * Draws `image` onto `canvas` as a full-frame Bayer dither at `width` x `height` CSS pixels.
 * Pure and framework-free, so it also works for exporting a PNG with canvas.toBlob().
 */
export function drawDither(
  canvas: HTMLCanvasElement,
  image: Source,
  width: number,
  height: number,
  options: DitherOptions & { colorElement?: Element | null } = {}
) {
  const { dark = "#000", light = "#fff", colorElement } = options
  const { bits, bw, bh, cell } = ditherBitmap(image, width, height, options)
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1
  canvas.width = Math.max(1, Math.round(width * dpr))
  canvas.height = Math.max(1, Math.round(height * dpr))
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  const block = document.createElement("canvas")
  block.width = bw
  block.height = bh
  const bctx = block.getContext("2d")
  if (!bctx) return
  const img = bctx.createImageData(bw, bh)
  const d = parseColor(dark, colorElement)
  const l = parseColor(light, colorElement)
  for (let i = 0; i < bits.length; i++) {
    const c = bits[i] ? l : d
    img.data[i * 4] = c[0]
    img.data[i * 4 + 1] = c[1]
    img.data[i * 4 + 2] = c[2]
    img.data[i * 4 + 3] = c[3]
  }
  bctx.putImageData(img, 0, 0)
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(block, 0, 0, bw * cell, bh * cell)
}

/** Deterministic hash of integer coordinates to [0, 1). */
function hash(x: number, y: number, seed: number) {
  let h = (x * 374761393 + y * 668265263 + seed * 2246822519) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296
}

export interface DitheringHoverProps
  extends DitherOptions,
    Omit<React.ComponentProps<"div">, "color" | "children"> {
  /** Image URL. Cross-origin images must be served with CORS headers, or the canvas cannot read them. */
  src: string
  /** Accessible description. Leave empty for decorative images. */
  alt?: string
  /** Diameter of the dithered zone in CSS pixels, 60 to 500. Default 240. */
  zoneSize?: number
  /** Number of streaks radiating from the zone. 0 for a clean circle. Default 28. */
  streaks?: number
  /** Streak reach as a multiple of the zone radius. Default 1. */
  streakLength?: number
  /** How ragged the rim and streaks are, 0 to 1. Default 0.6. */
  roughness?: number
  /** "inside" dithers under the cursor; "outside" dithers everything except the cursor zone. Default "inside". */
  mode?: "inside" | "outside"
  /** Pointer follow easing per frame, 0 to 1. 1 snaps, smaller values lag behind. Default 0.2. */
  ease?: number
  /** Seed for the streak layout. Change it to get a different pattern. Default 7. */
  seed?: number
  /** Default "anonymous". Pass undefined for same-origin images that must not send a CORS request. */
  crossOrigin?: "anonymous" | "use-credentials"
  /** Called once the image is loaded and first drawn. */
  onRendered?: () => void
  /** Content layered over the canvas (captions, badges). */
  children?: React.ReactNode
}

export function DitheringHover({
  src,
  alt = "",
  zoneSize = 240,
  dotSize = 4,
  matrix = 8,
  dark = "#000",
  light = "#fff",
  contrast = 1,
  brightness = 0,
  fit = "cover",
  streaks = 28,
  streakLength = 1,
  roughness = 0.6,
  mode = "inside",
  ease = 0.2,
  seed = 7,
  crossOrigin = "anonymous",
  onRendered,
  children,
  className,
  style,
  ...props
}: DitheringHoverProps) {
  const wrapRef = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const [image, setImage] = React.useState<HTMLImageElement | null>(null)
  const [aspect, setAspect] = React.useState<number | null>(null)
  const [themeTick, setThemeTick] = React.useState(0)
  const onRenderedRef = React.useRef(onRendered)
  onRenderedRef.current = onRendered

  // Pointer state lives in refs so moves never re-render React.
  const pointer = React.useRef({ x: 0, y: 0, tx: 0, ty: 0, scale: 0, target: 0 })
  const rafRef = React.useRef(0)

  React.useEffect(() => {
    if (!src) return
    let cancelled = false
    const img = new Image()
    if (crossOrigin) img.crossOrigin = crossOrigin
    img.onload = () => {
      if (cancelled) return
      setAspect(img.naturalWidth / img.naturalHeight)
      setImage(img)
    }
    img.src = src
    return () => {
      cancelled = true
    }
  }, [src, crossOrigin])

  // `currentColor` must re-ink when the theme changes.
  React.useEffect(() => {
    if (dark !== "currentColor" && light !== "currentColor") return
    const root = document.documentElement
    const observer = new MutationObserver(() => setThemeTick((t) => t + 1))
    observer.observe(root, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
    return () => observer.disconnect()
  }, [dark, light])

  React.useEffect(() => {
    const wrap = wrapRef.current
    const canvas = canvasRef.current
    if (!wrap || !canvas || !image) return

    const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false
    const follow = reduceMotion ? 1 : Math.min(1, Math.max(0.02, ease))

    // Cached layers, rebuilt on resize or option change.
    let width = 0
    let height = 0
    let dpr = 1
    let cell = Math.max(1, dotSize)
    let bw = 0
    let bh = 0
    let bits = new Uint8Array(0)
    let darkRGBA: [number, number, number, number] = [0, 0, 0, 255]
    let lightRGBA: [number, number, number, number] = [255, 255, 255, 255]
    const photo = document.createElement("canvas")
    const ink = document.createElement("canvas")
    const mask = document.createElement("canvas")
    const patch = document.createElement("canvas")
    let maskData: ImageData | null = null
    let rendered = false

    // Streak layout, fixed per seed.
    const rays: { angle: number; len: number; width: number }[] = []
    for (let i = 0; i < streaks; i++) {
      const jitter = (hash(i, 1, seed) - 0.5) * ((Math.PI * 2) / Math.max(1, streaks)) * 0.9
      rays.push({
        angle: (i / Math.max(1, streaks)) * Math.PI * 2 + jitter,
        len: 0.35 + hash(i, 2, seed) * 0.65,
        width: 0.7 + hash(i, 3, seed) * 1.3,
      })
    }

    const build = () => {
      const rect = wrap.getBoundingClientRect()
      width = Math.max(1, Math.round(rect.width))
      height = Math.max(1, Math.round(rect.height))
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const result = ditherBitmap(image, width, height, { dotSize, matrix, contrast, brightness, fit })
      bits = result.bits
      bw = result.bw
      bh = result.bh
      cell = result.cell
      darkRGBA = parseColor(dark, wrap)
      lightRGBA = parseColor(light, wrap)

      photo.width = ink.width = canvas.width
      photo.height = ink.height = canvas.height
      const pctx = photo.getContext("2d")
      const ictx = ink.getContext("2d")
      if (!pctx || !ictx) return
      pctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      drawCover(pctx, image, width, height, fit)

      const block = document.createElement("canvas")
      block.width = bw
      block.height = bh
      const bctx = block.getContext("2d")
      if (!bctx) return
      const img = bctx.createImageData(bw, bh)
      for (let i = 0; i < bits.length; i++) {
        const c = bits[i] ? lightRGBA : darkRGBA
        img.data[i * 4] = c[0]
        img.data[i * 4 + 1] = c[1]
        img.data[i * 4 + 2] = c[2]
        img.data[i * 4 + 3] = c[3]
      }
      bctx.putImageData(img, 0, 0)
      ictx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ictx.imageSmoothingEnabled = false
      ictx.drawImage(block, 0, 0, bw * cell, bh * cell)

      maskData = null
      draw()
    }

    const draw = () => {
      const ctx = canvas.getContext("2d")
      if (!ctx || !bw) return
      const p = pointer.current
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const base = mode === "inside" ? photo : ink
      const top = mode === "inside" ? ink : photo
      ctx.drawImage(base, 0, 0)

      const radius = (zoneSize / 2) * p.scale
      if (radius >= 1) {
        const reach = radius * (1 + Math.max(0, streakLength) * (streaks > 0 ? 1 : 0)) + cell
        const x0 = Math.max(0, Math.floor((p.x - reach) / cell))
        const y0 = Math.max(0, Math.floor((p.y - reach) / cell))
        const x1 = Math.min(bw - 1, Math.ceil((p.x + reach) / cell))
        const y1 = Math.min(bh - 1, Math.ceil((p.y + reach) / cell))
        const rw = x1 - x0 + 1
        const rh = y1 - y0 + 1
        if (rw > 0 && rh > 0) {
          const mctx = mask.getContext("2d")
          if (!mctx) return
          if (mask.width !== rw || mask.height !== rh || !maskData) {
            mask.width = rw
            mask.height = rh
            maskData = mctx.createImageData(rw, rh)
          }
          const data = maskData.data
          const core = radius * (1 - 0.3 * roughness)
          const rim = Math.max(1e-3, radius - core)
          const rayWidth = cell * 1.2
          const fuzz = 0.25 + 0.75 * roughness
          for (let by = 0; by < rh; by++) {
            const cy = (y0 + by + 0.5) * cell - p.y
            for (let bx = 0; bx < rw; bx++) {
              const cx = (x0 + bx + 0.5) * cell - p.x
              const d = Math.hypot(cx, cy)
              let on = false
              if (d <= core) on = true
              else if (d <= radius) {
                on = hash(x0 + bx, y0 + by, seed) > ((d - core) / rim) * fuzz
              } else if (streaks > 0) {
                const a = Math.atan2(cy, cx)
                for (let i = 0; i < rays.length; i++) {
                  const r = rays[i]
                  let da = a - r.angle
                  da = Math.atan2(Math.sin(da), Math.cos(da))
                  const perp = Math.abs(d * Math.sin(da))
                  if (perp > rayWidth * r.width || Math.cos(da) < 0) continue
                  const len = radius * streakLength * r.len
                  const t = (d - radius) / Math.max(1e-3, len)
                  if (t > 1) continue
                  // Gaps along the streak, denser towards the tip.
                  const seg = Math.floor(d / (cell * 2))
                  if (hash(i, seg, seed + 11) < t * fuzz) continue
                  if (hash(x0 + bx, y0 + by, seed + 5) < t * t) continue
                  on = true
                  break
                }
              }
              const k = (by * rw + bx) * 4
              data[k] = 255
              data[k + 1] = 255
              data[k + 2] = 255
              data[k + 3] = on ? 255 : 0
            }
          }
          mctx.putImageData(maskData, 0, 0)

          // Cut the top layer to the mask and lay it over the base.
          const px = Math.round(x0 * cell * dpr)
          const py = Math.round(y0 * cell * dpr)
          const pw = Math.round(rw * cell * dpr)
          const ph = Math.round(rh * cell * dpr)
          if (patch.width !== pw || patch.height !== ph) {
            patch.width = pw
            patch.height = ph
          }
          const tctx = patch.getContext("2d")
          if (!tctx) return
          tctx.globalCompositeOperation = "source-over"
          tctx.clearRect(0, 0, pw, ph)
          tctx.drawImage(top, px, py, pw, ph, 0, 0, pw, ph)
          tctx.globalCompositeOperation = "destination-in"
          tctx.imageSmoothingEnabled = false
          tctx.drawImage(mask, 0, 0, pw, ph)
          ctx.drawImage(patch, px, py)
        }
      }
      if (!rendered) {
        rendered = true
        onRenderedRef.current?.()
      }
    }

    const tick = () => {
      rafRef.current = 0
      const p = pointer.current
      p.x += (p.tx - p.x) * follow
      p.y += (p.ty - p.y) * follow
      p.scale += (p.target - p.scale) * (reduceMotion ? 1 : 0.12)
      const settled =
        Math.abs(p.tx - p.x) < 0.3 && Math.abs(p.ty - p.y) < 0.3 && Math.abs(p.target - p.scale) < 0.005
      if (settled) {
        p.x = p.tx
        p.y = p.ty
        p.scale = p.target
      }
      draw()
      if (!settled) rafRef.current = requestAnimationFrame(tick)
    }
    const wake = () => {
      if (!rafRef.current) rafRef.current = requestAnimationFrame(tick)
    }

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect()
      const p = pointer.current
      p.tx = e.clientX - rect.left
      p.ty = e.clientY - rect.top
      if (p.target === 0) {
        // Arrive at the cursor instead of sliding in from the last position.
        p.x = p.tx
        p.y = p.ty
      }
      p.target = 1
      wake()
    }
    const onLeave = () => {
      pointer.current.target = 0
      wake()
    }

    wrap.addEventListener("pointermove", onMove)
    wrap.addEventListener("pointerdown", onMove)
    wrap.addEventListener("pointerleave", onLeave)
    wrap.addEventListener("pointercancel", onLeave)

    const ro = new ResizeObserver(build)
    ro.observe(wrap)
    build()

    return () => {
      wrap.removeEventListener("pointermove", onMove)
      wrap.removeEventListener("pointerdown", onMove)
      wrap.removeEventListener("pointerleave", onLeave)
      wrap.removeEventListener("pointercancel", onLeave)
      ro.disconnect()
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [
    image,
    zoneSize,
    dotSize,
    matrix,
    dark,
    light,
    contrast,
    brightness,
    fit,
    streaks,
    streakLength,
    roughness,
    mode,
    ease,
    seed,
    themeTick,
  ])

  return (
    <div
      ref={wrapRef}
      data-slot="dithering-hover"
      className={cn("relative overflow-hidden select-none", className)}
      style={{ aspectRatio: aspect ?? undefined, ...style }}
      {...props}
    >
      <canvas
        ref={canvasRef}
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        aria-hidden={alt ? undefined : true}
        className="absolute inset-0 block size-full"
      />
      {children}
    </div>
  )
}
