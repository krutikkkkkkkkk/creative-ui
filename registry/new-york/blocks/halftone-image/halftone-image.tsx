"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type HalftoneShape = "dot" | "line" | "square"

export interface HalftoneOptions {
  /** Screen pitch in CSS pixels. Smaller is finer. Default 6. */
  dotSize?: number
  /** Screen angle in degrees. 45 is the classic print angle. Default 45. */
  angle?: number
  /** Ink colour. Any CSS colour. Default "#111". */
  color?: string
  /** Paper colour behind the dots. Default "transparent". */
  background?: string
  /** Dot, line or square screen. Default "dot". */
  shape?: HalftoneShape
  /** Screen the highlights instead of the shadows (for light ink on dark paper). Default false. */
  invert?: boolean
  /** Tone curve steepness, roughly 0.5 to 2. Default 1. */
  contrast?: number
  /** Largest mark relative to the cell. 1 means marks just touch; above 1 lets shadows close up. Default 1.15. */
  gain?: number
  /** How the source fills the canvas. Default "cover". */
  fit?: "cover" | "contain"
}

type Source = HTMLImageElement | HTMLCanvasElement | HTMLVideoElement | ImageBitmap

function sourceSize(image: Source): [number, number] {
  if ("naturalWidth" in image && image.naturalWidth) return [image.naturalWidth, image.naturalHeight]
  if ("videoWidth" in image && image.videoWidth) return [image.videoWidth, image.videoHeight]
  return [image.width, image.height]
}

/**
 * Draws `image` onto `canvas` as a halftone screen at `width` x `height` CSS pixels.
 * Pure and framework-free, so it can also be used to export a PNG via canvas.toBlob().
 */
export function drawHalftone(
  canvas: HTMLCanvasElement,
  image: Source,
  width: number,
  height: number,
  options: HalftoneOptions = {}
) {
  const {
    dotSize = 6,
    angle = 45,
    color = "#111",
    background = "transparent",
    shape = "dot",
    invert = false,
    contrast = 1,
    gain = 1.15,
    fit = "cover",
  } = options

  const cell = Math.max(2, dotSize)
  const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1
  canvas.width = Math.max(1, Math.round(width * dpr))
  canvas.height = Math.max(1, Math.round(height * dpr))
  const ctx = canvas.getContext("2d")
  if (!ctx) return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  ctx.clearRect(0, 0, width, height)
  if (background !== "transparent") {
    ctx.fillStyle = background
    ctx.fillRect(0, 0, width, height)
  }

  // Sample buffer at roughly two samples per cell. drawImage averages the pixels for us.
  const k = Math.max(1, cell / 2)
  const sw = Math.max(1, Math.ceil(width / k))
  const sh = Math.max(1, Math.ceil(height / k))
  const off = document.createElement("canvas")
  off.width = sw
  off.height = sh
  const octx = off.getContext("2d", { willReadFrequently: true })
  if (!octx) return
  const [iw, ih] = sourceSize(image)
  if (!iw || !ih) return
  const scale = fit === "cover" ? Math.max(sw / iw, sh / ih) : Math.min(sw / iw, sh / ih)
  const dw = iw * scale
  const dh = ih * scale
  octx.drawImage(image, (sw - dw) / 2, (sh - dh) / 2, dw, dh)
  const data = octx.getImageData(0, 0, sw, sh).data

  const rad = (angle * Math.PI) / 180
  const cos = Math.cos(rad)
  const sin = Math.sin(rad)
  const cx = width / 2
  const cy = height / 2
  const half = Math.hypot(width, height) / 2 + cell

  ctx.fillStyle = color
  for (let v = -half; v <= half; v += cell) {
    for (let u = -half; u <= half; u += cell) {
      const x = cx + u * cos - v * sin
      const y = cy + u * sin + v * cos
      if (x < -cell || y < -cell || x > width + cell || y > height + cell) continue

      const sx = Math.min(sw - 1, Math.max(0, Math.floor(x / k)))
      const sy = Math.min(sh - 1, Math.max(0, Math.floor(y / k)))
      const i = (sy * sw + sx) * 4
      const alpha = data[i + 3] / 255
      const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255
      let d = invert ? lum : 1 - lum
      d = Math.min(1, Math.max(0, (d - 0.5) * contrast + 0.5)) * alpha
      if (d < 0.02) continue

      if (shape === "dot") {
        // Area, not radius, should track darkness.
        const r = (Math.sqrt(d) * cell * gain) / 2
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      } else {
        ctx.save()
        ctx.translate(x, y)
        ctx.rotate(rad)
        if (shape === "square") {
          const s = Math.sqrt(d) * cell * gain
          ctx.fillRect(-s / 2, -s / 2, s, s)
        } else {
          const t = d * cell * gain
          ctx.fillRect(-cell / 2 - 0.3, -t / 2, cell + 0.6, t)
        }
        ctx.restore()
      }
    }
  }
}

export interface HalftoneImageProps
  extends HalftoneOptions,
    Omit<React.ComponentProps<"div">, "color" | "children"> {
  /** Image URL. Cross-origin images must be served with CORS headers, or the canvas cannot read them. */
  src: string
  /** Accessible description. Leave empty for decorative images. */
  alt?: string
  /** Default "anonymous". Pass undefined for same-origin images that must not send a CORS request. */
  crossOrigin?: "anonymous" | "use-credentials"
  /** Called after each draw. */
  onRendered?: () => void
  /** Content layered over the halftone (captions, badges). */
  children?: React.ReactNode
}

/**
 * Renders any image as a print-style halftone screen on a canvas. Size it like an
 * image: give it a width (and optionally a height or aspect ratio) with className.
 * Without an explicit height it adopts the source image's aspect ratio.
 */
export function HalftoneImage({
  src,
  alt = "",
  crossOrigin = "anonymous",
  dotSize = 6,
  angle = 45,
  color = "currentColor",
  background = "transparent",
  shape = "dot",
  invert = false,
  contrast = 1,
  gain = 1.15,
  fit = "cover",
  onRendered,
  className,
  style,
  children,
  ...props
}: HalftoneImageProps) {
  const ref = React.useRef<HTMLDivElement>(null)
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const renderedRef = React.useRef(onRendered)
  renderedRef.current = onRendered

  const [image, setImage] = React.useState<HTMLImageElement | null>(null)
  const [ratio, setRatio] = React.useState<number | undefined>(undefined)

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
    if (!el || !canvas || !image) return

    let frame = 0
    const render = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const { width, height } = el.getBoundingClientRect()
        if (!width || !height) return
        const ink = color === "currentColor" ? getComputedStyle(el).color : color
        const paper = background === "currentColor" ? getComputedStyle(el).color : background
        try {
          drawHalftone(canvas, image, width, height, {
            dotSize,
            angle,
            color: ink,
            background: paper,
            shape,
            invert,
            contrast,
            gain,
            fit,
          })
          renderedRef.current?.()
        } catch (error) {
          console.warn(
            "HalftoneImage: could not read the image pixels. Serve it from the same origin or with CORS headers.",
            error
          )
        }
      })
    }

    render()
    const ro = new ResizeObserver(render)
    ro.observe(el)
    // Re-ink when the theme flips and the colour is inherited.
    const inherits = color === "currentColor" || background === "currentColor"
    const mo = inherits ? new MutationObserver(render) : null
    mo?.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "style", "data-theme"],
    })

    return () => {
      ro.disconnect()
      mo?.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [image, dotSize, angle, color, background, shape, invert, contrast, gain, fit])

  return (
    <div
      ref={ref}
      data-slot="halftone-image"
      className={cn("relative overflow-hidden", className)}
      style={{ aspectRatio: ratio, ...style }}
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
