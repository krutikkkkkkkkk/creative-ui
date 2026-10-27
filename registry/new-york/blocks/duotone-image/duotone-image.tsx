"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type DuotonePreset =
  | "riso"
  | "newsprint"
  | "cyanotype"
  | "sepia"
  | "fluoro"
  | "forest"
  | "midnight"

/** Two-ink pairs: the ink that fills shadows and the ink (or paper) that fills highlights. */
export const duotonePresets: Record<DuotonePreset, { shadow: string; highlight: string }> = {
  riso: { shadow: "#1d3fb0", highlight: "#ffe0e6" },
  newsprint: { shadow: "#15130f", highlight: "#f2ede2" },
  cyanotype: { shadow: "#0a2a6e", highlight: "#dbe7f5" },
  sepia: { shadow: "#3a2616", highlight: "#f1e3c6" },
  fluoro: { shadow: "#2a0c3f", highlight: "#ff6fbb" },
  forest: { shadow: "#0f3b2e", highlight: "#f1e6b8" },
  midnight: { shadow: "#0b1230", highlight: "#8fd3ff" },
}

type RGB = [number, number, number]

/** Parses #rgb, #rrggbb, #rrggbbaa, rgb() and rgba() into 0 to 1 channels. */
export function parseColor(input: string): RGB | null {
  const s = input.trim().toLowerCase()
  if (s.startsWith("#")) {
    const hex = s.slice(1)
    const full = hex.length === 3 || hex.length === 4 ? hex.split("").map((c) => c + c).join("") : hex
    if (full.length !== 6 && full.length !== 8) return null
    const n = Number.parseInt(full.slice(0, 6), 16)
    if (Number.isNaN(n)) return null
    return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
  }
  const m = s.match(/^rgba?\(\s*([\d.]+%?)[\s,]+([\d.]+%?)[\s,]+([\d.]+%?)/)
  if (m) {
    const ch = (v: string) => (v.endsWith("%") ? Number.parseFloat(v) / 100 : Number.parseFloat(v) / 255)
    return [ch(m[1]), ch(m[2]), ch(m[3])]
  }
  return null
}

const fmt = (n: number) => Math.min(1, Math.max(0, n)).toFixed(4)
const clamp01 = (n: number) => Math.min(1, Math.max(0, n))

/** Opacity of the misregistered pass while it is out of register, before it settles. */
const PULL_OPACITY = 0.7

export interface DuotoneImageProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Image URL. Omit when wrapping your own element with `children`. */
  src?: string
  /** Accessible description. Leave empty for decorative images. */
  alt?: string
  /** A named ink pair. Overridden by `shadow` and `highlight`. Default "riso". */
  preset?: DuotonePreset
  /** Ink for the shadows. Hex or rgb(); CSS variables cannot be read on the server. */
  shadow?: string
  /** Ink for the highlights. Hex or rgb(). */
  highlight?: string
  /** Strength of the effect over the original, 0 to 1. Default 1. Ignored when wrapping `children`. */
  mix?: number
  /** Tone contrast before inking, roughly 0.5 to 2. Default 1.1. */
  contrast?: number
  /** Riso-style misregistration: offsets a second pass of the shadow ink by this many px. Default 0. */
  offset?: number
  /** Direction of the misregistration in degrees. Default 30. */
  offsetAngle?: number
  /**
   * Animate the shadow pass into register. "view" slides it in once, the first time the image scrolls
   * into view. "scroll" ties it to the image's position in the viewport. Needs `src`. Default "static".
   */
  registration?: "static" | "view" | "scroll"
  /** How far out of register the pass starts, in px. It also starts turned by a degree or two. Default 24. */
  registrationOffset?: number
  /** Length of the "view" slide in ms. Default 1200. */
  registrationDuration?: number
  /** How the image fills the box. Default "cover". */
  fit?: "cover" | "contain"
  /** Class names for the img element. */
  imageClassName?: string
  /** Filter an existing element (e.g. next/image) instead of rendering an img. */
  children?: React.ReactNode
}

/**
 * Two-ink colour treatment for photos, in the spirit of risograph and screen prints.
 * Pure SVG filters, so it works on any image element without CORS.
 */
export function DuotoneImage({
  src,
  alt = "",
  preset = "riso",
  shadow,
  highlight,
  mix = 1,
  contrast = 1.1,
  offset = 0,
  offsetAngle = 30,
  registration = "static",
  registrationOffset = 24,
  registrationDuration = 1200,
  fit = "cover",
  imageClassName,
  className,
  style,
  children,
  ...props
}: DuotoneImageProps) {
  const id = React.useId().replace(/:/g, "")
  const duoId = `duo-${id}`
  const inkId = `ink-${id}`
  const rootRef = React.useRef<HTMLDivElement>(null)
  const passRef = React.useRef<HTMLDivElement>(null)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const animated = registration !== "static" && !children
  const [registered, setRegistered] = React.useState(!animated)

  const base = duotonePresets[preset]
  const dark = parseColor(shadow ?? base.shadow) ?? [0, 0, 0]
  const light = parseColor(highlight ?? base.highlight) ?? [1, 1, 1]
  const slope = contrast
  const intercept = 0.5 - 0.5 * contrast

  const rad = (offsetAngle * Math.PI) / 180
  const dx = Math.cos(rad) * offset
  const dy = Math.sin(rad) * offset
  // Where the pass rests, and where it starts: further out along the same line, turned a little,
  // like a second drum pulled before the paper was squared up.
  const restOpacity = offset > 0 ? 0.55 : 0
  const pullX = dx + Math.cos(rad) * registrationOffset
  const pullY = dy + Math.sin(rad) * registrationOffset
  const pullTurn = registrationOffset * 0.06
  const rest = `translate(${dx}px, ${dy}px)`

  React.useEffect(() => {
    const el = rootRef.current
    if (!animated || !el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    if (registration === "scroll") {
      const pass = passRef.current
      let raf = 0
      const measure = () => {
        raf = 0
        if (!pass) return
        const r = el.getBoundingClientRect()
        const vh = window.innerHeight || 1
        // Out of register as the image enters, in register once its top reaches the upper half.
        const p = clamp01((vh * 0.95 - r.top) / (vh * 0.55))
        const t = 1 - (1 - p) ** 3
        const fade = clamp01((p - 0.5) / 0.5)
        pass.style.transform = `translate(${pullX + (dx - pullX) * t}px, ${pullY + (dy - pullY) * t}px) rotate(${pullTurn * (1 - t)}deg)`
        pass.style.opacity = String(PULL_OPACITY + (restOpacity - PULL_OPACITY) * fade * fade * (3 - 2 * fade))
      }
      const schedule = () => {
        if (!raf) raf = requestAnimationFrame(measure)
      }
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          window.addEventListener("scroll", schedule, { passive: true })
          window.addEventListener("resize", schedule)
          schedule()
        } else {
          window.removeEventListener("scroll", schedule)
          window.removeEventListener("resize", schedule)
        }
      })
      observer.observe(el)
      return () => {
        observer.disconnect()
        window.removeEventListener("scroll", schedule)
        window.removeEventListener("resize", schedule)
        cancelAnimationFrame(raf)
      }
    }

    if (registered) return
    const img = imgRef.current
    let observer: IntersectionObserver | undefined
    // Wait until there is something to watch: a visible tab and a loaded image.
    const start = () => {
      if (document.visibilityState !== "visible" || (img && !img.complete)) return
      document.removeEventListener("visibilitychange", start)
      img?.removeEventListener("load", start)
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          observer?.disconnect()
          setRegistered(true)
        },
        { threshold: 0.35 }
      )
      observer.observe(el)
    }
    document.addEventListener("visibilitychange", start)
    img?.addEventListener("load", start)
    start()
    return () => {
      document.removeEventListener("visibilitychange", start)
      img?.removeEventListener("load", start)
      observer?.disconnect()
    }
  }, [animated, registration, registered, dx, dy, pullX, pullY, pullTurn, restOpacity])

  const filter = (
    <svg aria-hidden className="pointer-events-none absolute size-0 overflow-hidden" focusable="false">
      <defs>
        <filter id={duoId} colorInterpolationFilters="sRGB">
          <feColorMatrix
            type="matrix"
            values="0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0"
          />
          <feComponentTransfer>
            <feFuncR type="linear" slope={slope} intercept={intercept} />
            <feFuncG type="linear" slope={slope} intercept={intercept} />
            <feFuncB type="linear" slope={slope} intercept={intercept} />
          </feComponentTransfer>
          <feComponentTransfer>
            <feFuncR type="table" tableValues={`${fmt(dark[0])} ${fmt(light[0])}`} />
            <feFuncG type="table" tableValues={`${fmt(dark[1])} ${fmt(light[1])}`} />
            <feFuncB type="table" tableValues={`${fmt(dark[2])} ${fmt(light[2])}`} />
          </feComponentTransfer>
        </filter>
        {(offset > 0 || animated) && (
          <filter
            id={inkId}
            colorInterpolationFilters="sRGB"
            // Clear pixels read as full ink, so the default 10% filter margin would print a solid bar
            // along the offset edges. Clip the pass to the image.
            x="0"
            y="0"
            width="100%"
            height="100%"
          >
            {/* Shadow ink only, with alpha = darkness, for the misregistered pass. */}
            <feColorMatrix
              type="matrix"
              values={`0 0 0 0 ${fmt(dark[0])}  0 0 0 0 ${fmt(dark[1])}  0 0 0 0 ${fmt(dark[2])}  ${(-0.2126 * slope).toFixed(4)} ${(-0.7152 * slope).toFixed(4)} ${(-0.0722 * slope).toFixed(4)} 0 ${(1 - intercept).toFixed(4)}`}
            />
          </filter>
        )}
      </defs>
    </svg>
  )

  const imgClass = cn("block size-full", fit === "cover" ? "object-cover" : "object-contain", imageClassName)

  if (children) {
    return (
      <div data-slot="duotone-image" className={cn("relative", className)} style={style} {...props}>
        {filter}
        <div className="size-full" style={{ filter: `url(#${duoId})` }}>
          {children}
        </div>
      </div>
    )
  }

  const original = (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={imgRef} src={src} alt={alt} draggable={false} className={imgClass} />
  )

  return (
    <div
      ref={rootRef}
      data-slot="duotone-image"
      data-state={animated ? (registered ? "registered" : "pulled") : undefined}
      className={cn("relative overflow-hidden", animated && "group/duotone", className)}
      style={style}
      {...props}
    >
      {filter}
      {mix < 1 ? (
        <>
          {original}
          <div aria-hidden className="absolute inset-0" style={{ opacity: mix, filter: `url(#${duoId})` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" draggable={false} className={imgClass} />
          </div>
        </>
      ) : (
        <div className="size-full" style={{ filter: `url(#${duoId})` }}>
          {original}
        </div>
      )}
      {animated ? (
        <div
          ref={passRef}
          aria-hidden
          // Reduced motion never sees the pulled state, so the print is in register from the first paint.
          className={cn(
            "absolute inset-0 mix-blend-multiply transform-(--duo-rest) opacity-(--duo-rest-opacity)",
            "motion-safe:group-data-[state=pulled]/duotone:transform-(--duo-pull) motion-safe:group-data-[state=pulled]/duotone:opacity-(--duo-pull-opacity)"
          )}
          style={
            {
              filter: `url(#${inkId})`,
              "--duo-rest": rest,
              "--duo-pull": `translate(${pullX}px, ${pullY}px) rotate(${pullTurn}deg)`,
              "--duo-rest-opacity": restOpacity,
              "--duo-pull-opacity": PULL_OPACITY,
              // The plate eases off the mark and settles into register; the doubled ink clears once it is nearly home.
              transition:
                registration === "view"
                  ? `transform ${registrationDuration}ms cubic-bezier(0.77, 0, 0.175, 1), opacity ${registrationDuration / 2}ms cubic-bezier(0.23, 1, 0.32, 1) ${registrationDuration / 2}ms`
                  : undefined,
            } as React.CSSProperties
          }
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt="" draggable={false} className={imgClass} />
        </div>
      ) : (
        offset > 0 && (
          <div
            aria-hidden
            className="absolute inset-0 mix-blend-multiply"
            style={{ filter: `url(#${inkId})`, transform: rest, opacity: 0.55 }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" draggable={false} className={imgClass} />
          </div>
        )
      )}
    </div>
  )
}
