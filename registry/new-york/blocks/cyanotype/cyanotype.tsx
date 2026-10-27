"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type CyanotypePreset = "classic" | "deep" | "tea" | "faded"

/**
 * Tone ramps from full exposure (darkest) to clear paper. The last stop is also the paper colour,
 * because a washed cyanotype's highlights are bare paper.
 */
export const cyanotypePresets: Record<CyanotypePreset, string[]> = {
  classic: ["#0d1f4a", "#17407f", "#3f74ad", "#9dbcd8", "#f2efe6"],
  deep: ["#06112c", "#0d2a63", "#22579a", "#7aa2ca", "#eef0ea"],
  tea: ["#1b1a2c", "#363853", "#676577", "#b8a888", "#eadcbf"],
  faded: ["#26568a", "#4979ab", "#7ea4c7", "#bed3e4", "#f4f1e8"],
}

/** Unwashed ferric sensitizer, the yellow-green the paper shows before the water bath. */
const SENSITIZER = "#d6d07c"

type RGB = [number, number, number]

/** Parses #rgb and #rrggbb into 0 to 1 channels. */
function parseHex(input: string): RGB | null {
  const hex = input.trim().replace(/^#/, "")
  const full = hex.length === 3 ? hex.split("").map((c) => c + c).join("") : hex.slice(0, 6)
  const n = Number.parseInt(full, 16)
  if (full.length !== 6 || Number.isNaN(n)) return null
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255]
}

const fmt = (n: number) => Number(Math.min(1, Math.max(0, n)).toFixed(4))

/** Paper tooth: dark and light specks on transparent, so it needs no blend mode. */
const PAPER_TOOTH = `url("data:image/svg+xml;utf8,${encodeURIComponent(
  "<svg xmlns='http://www.w3.org/2000/svg' width='320' height='320'>" +
    "<filter id='p' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>" +
    "<feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' seed='4' stitchTiles='stitch' result='t'/>" +
    "<feColorMatrix in='t' type='matrix' values='0 0 0 0 0.2 0 0 0 0 0.16 0 0 0 0 0.1 -2 0 0 0 1' result='d'/>" +
    "<feColorMatrix in='t' type='matrix' values='0 0 0 0 1 0 0 0 0 0.99 0 0 0 0 0.95 2 0 0 0 -1' result='l'/>" +
    "<feMerge><feMergeNode in='d'/><feMergeNode in='l'/></feMerge>" +
    "</filter><rect width='100%' height='100%' filter='url(#p)'/></svg>"
)}")`

/**
 * Filter primitives for a hand-brushed coating edge. Bristle noise (fast along y) pushes the left and
 * right edges into streaks; slow noise makes the top and bottom wavy. A blurred copy of the edge, roughened
 * with grain, thins the coating into dry-brush specks. Same seed, same edge, so layers line up exactly.
 */
function brushEdge(seed: number, roughness: number) {
  const r = Math.min(1, Math.max(0, roughness))
  return (
    <>
      <feTurbulence type="fractalNoise" baseFrequency="0.004 0.045" numOctaves={5} seed={seed} result="bristle" />
      <feTurbulence type="fractalNoise" baseFrequency="0.018" numOctaves={4} seed={seed + 1} result="wobble" />
      <feColorMatrix in="bristle" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0 1" result="bx" />
      <feColorMatrix in="wobble" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 0 1" result="wy" />
      <feComposite in="bx" in2="wy" operator="arithmetic" k2={1} k3={1} result="map" />
      <feComponentTransfer in="map" result="map">
        {/* fractalNoise sits near 0.5; stretch it so the streaks reach deep into the coating. */}
        <feFuncR type="linear" slope={1.9} intercept={-0.45} />
        <feFuncG type="linear" slope={1.6} intercept={-0.3} />
      </feComponentTransfer>
      <feDisplacementMap
        in="SourceAlpha"
        in2="map"
        scale={r * 72}
        xChannelSelector="R"
        yChannelSelector="G"
        result="ragged"
      />
      <feGaussianBlur in="ragged" stdDeviation={2 + r * 10} result="soft" />
      <feTurbulence type="fractalNoise" baseFrequency="0.35 0.6" numOctaves={2} seed={seed + 2} result="grain" />
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  1 0 0 0 0" result="grainA" />
      <feComposite in="soft" in2="grainA" operator="arithmetic" k2={1} k3={1.2 * r} k4={-0.6 * r} result="worn" />
      <feComponentTransfer in="worn" result="coat">
        {/* Inside the coating this clamps to 1; in the thin band at the edge the grain breaks it up. */}
        <feFuncA type="linear" slope={3} intercept={-0.9} />
      </feComponentTransfer>
      <feComposite in="ragged" in2="coat" operator="in" result="edge" />
    </>
  )
}

export interface CyanotypeProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Image URL. Omit when wrapping your own element with `children`. */
  src?: string
  /** Accessible description. Leave empty for decorative images. */
  alt?: string
  /**
   * "print" contact-prints the image as a positive. "photogram" treats it as objects laid on the paper:
   * dark or opaque shapes stay white, everything else exposes to blue. Default "print".
   */
  mode?: "print" | "photogram"
  /** A named tone ramp. Overridden by `ramp`. Default "classic". */
  preset?: CyanotypePreset
  /** Custom tone stops from full exposure to bare paper, as hex. The last stop is the paper colour. */
  ramp?: string[]
  /** Exposure, -1 to 1. Higher prints darker and deeper, lower leaves it pale. Default 0. */
  exposure?: number
  /** Tone contrast, roughly 0.5 to 2. Default 1.15. */
  contrast?: number
  /** Ragged, streaky brush edge on the coating, 0 to 1. 0 is a clean rectangle. Default 0.6. */
  roughness?: number
  /** Uneven coating and exposure, 0 to 1. Default 0.4. */
  mottle?: number
  /** Paper tooth over the whole sheet, 0 to 1. Default 0.5. */
  texture?: number
  /** Bare paper around the brushed coating, in px. Default 24. */
  margin?: number
  /** Fully exposed blue border between the brush edge and the image, in px. Default 18. */
  border?: number
  /** Seed for the brush edge and mottle. Give each print in a set its own. Default 3. */
  seed?: number
  /** Wash the print from unexposed yellow-green to blue the first time it scrolls into view. Default false. */
  develop?: boolean
  /** Length of the develop wash in ms. Default 1800. */
  developDuration?: number
  /** How the image fills the box. Default "cover". */
  fit?: "cover" | "contain"
  /** Class names for the img element. */
  imageClassName?: string
  /** Print an existing element (e.g. next/image or an SVG) instead of rendering an img. */
  children?: React.ReactNode
}

/**
 * A photo as a hand-coated cyanotype: Prussian-blue tones, a brushed coating edge with an exposed border,
 * uneven coating and paper tooth. SVG filters only, so any image works without CORS.
 */
export function Cyanotype({
  src,
  alt = "",
  mode = "print",
  preset = "classic",
  ramp,
  exposure = 0,
  contrast = 1.15,
  roughness = 0.6,
  mottle = 0.4,
  texture = 0.5,
  margin = 24,
  border = 18,
  seed = 3,
  develop = false,
  developDuration = 1800,
  fit = "cover",
  imageClassName,
  className,
  style,
  children,
  ...props
}: CyanotypeProps) {
  const id = React.useId().replace(/[^\w-]/g, "")
  const toneId = `cyan-tone-${id}`
  const brushId = `cyan-brush-${id}`
  const rootRef = React.useRef<HTMLDivElement>(null)
  const [developed, setDeveloped] = React.useState(!develop)

  React.useEffect(() => {
    const el = rootRef.current
    if (developed || !el) return
    let observer: IntersectionObserver | undefined
    // A wash that plays in a background tab is a wash nobody saw. Wait for the tab to be visible.
    const start = () => {
      if (document.visibilityState !== "visible") return
      document.removeEventListener("visibilitychange", start)
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return
          observer?.disconnect()
          setDeveloped(true)
        },
        { threshold: 0.35 }
      )
      observer.observe(el)
    }
    document.addEventListener("visibilitychange", start)
    start()
    return () => {
      document.removeEventListener("visibilitychange", start)
      observer?.disconnect()
    }
  }, [developed])

  const stops = (ramp && ramp.length >= 2 ? ramp : cyanotypePresets[preset]).map((c) => parseHex(c) ?? [0, 0, 0])
  const paper = ramp?.at(-1) ?? cyanotypePresets[preset].at(-1)
  const table = (ch: 0 | 1 | 2) => stops.map((s) => fmt(s[ch])).join(" ")

  // Luminance, or its inverse for a photogram, with contrast and exposure folded into one linear step.
  const sign = mode === "photogram" ? -1 : 1
  const lum = `${0.2126 * sign} ${0.7152 * sign} ${0.0722 * sign} 0 ${mode === "photogram" ? 1 : 0}`
  const intercept = 0.5 - 0.5 * contrast - Math.min(1, Math.max(-1, exposure)) * 0.35
  const m = Math.min(1, Math.max(0, mottle)) * 0.5

  const wash = `opacity ${developDuration}ms cubic-bezier(0.23, 1, 0.32, 1)`
  const imgClass = cn("block size-full", fit === "cover" ? "object-cover" : "object-contain", imageClassName)

  return (
    <div
      ref={rootRef}
      data-slot="cyanotype"
      data-state={developed ? "developed" : "latent"}
      className={cn("group/cyanotype relative isolate overflow-hidden", className)}
      style={{ backgroundColor: paper, ...style }}
      {...props}
    >
      <svg aria-hidden className="pointer-events-none absolute size-0 overflow-hidden" focusable="false">
        <defs>
          <filter id={toneId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
            {/* Transparent pixels read as clear film: paper in a print, full exposure in a photogram. */}
            <feFlood floodColor="#fff" result="white" />
            <feComposite in="SourceGraphic" in2="white" operator="over" result="flat" />
            <feColorMatrix in="flat" type="matrix" values={`${lum}  ${lum}  ${lum}  0 0 0 0 1`} result="lum" />
            <feComponentTransfer in="lum" result="lum">
              <feFuncR type="linear" slope={contrast} intercept={intercept} />
              <feFuncG type="linear" slope={contrast} intercept={intercept} />
              <feFuncB type="linear" slope={contrast} intercept={intercept} />
            </feComponentTransfer>
            <feTurbulence type="fractalNoise" baseFrequency="0.007" numOctaves={3} seed={seed + 5} result="patch" />
            <feColorMatrix
              in="patch"
              type="matrix"
              values="1 0 0 0 0  1 0 0 0 0  1 0 0 0 0  0 0 0 0 1"
              result="patch"
            />
            <feComposite in="lum" in2="patch" operator="arithmetic" k2={1} k3={m} k4={-m / 2} result="coated" />
            <feComponentTransfer in="coated" result="toned">
              <feFuncR type="table" tableValues={table(0)} />
              <feFuncG type="table" tableValues={table(1)} />
              <feFuncB type="table" tableValues={table(2)} />
            </feComponentTransfer>
            {brushEdge(seed, roughness)}
            <feComposite in="toned" in2="edge" operator="in" />
          </filter>
          {develop && (
            <filter id={brushId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
              {brushEdge(seed, roughness)}
              <feComposite in="SourceGraphic" in2="edge" operator="in" />
            </filter>
          )}
        </defs>
      </svg>

      <div data-slot="cyanotype-coating" className="absolute" style={{ inset: margin }}>
        <div
          className={cn("size-full", develop && "motion-safe:group-data-[state=latent]/cyanotype:opacity-40")}
          style={develop ? { transition: wash } : undefined}
        >
          <div
            className="size-full"
            style={{
              filter: `url(#${toneId})`,
              padding: border,
              // Outside the negative the paper saw full light.
              backgroundColor: mode === "photogram" ? "#fff" : "#000",
            }}
          >
            <div className="relative size-full overflow-hidden">
              {children ?? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={src} alt={alt} draggable={false} className={imgClass} />
              )}
            </div>
          </div>
        </div>
        {develop && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-0 mix-blend-multiply motion-safe:group-data-[state=latent]/cyanotype:opacity-90"
            style={{
              backgroundColor: SENSITIZER,
              filter: `url(#${brushId})`,
              // The yellow holds for a beat, then washes off like the water bath, while the blue deepens.
              transition: `opacity ${developDuration}ms cubic-bezier(0.77, 0, 0.175, 1)`,
            }}
          />
        )}
      </div>

      {texture > 0 && (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 forced-colors:hidden"
          style={{ backgroundImage: PAPER_TOOTH, backgroundSize: "320px 320px", opacity: Math.min(1, texture) * 0.35 }}
        />
      )}
    </div>
  )
}
