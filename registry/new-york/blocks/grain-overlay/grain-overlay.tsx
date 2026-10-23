import * as React from "react"

import { cn } from "@/lib/utils"

export type GrainVariant = "grain" | "paper" | "fiber"

export interface GrainOverlayProps extends Omit<React.ComponentProps<"div">, "color"> {
  /**
   * "grain" is fine film noise, "paper" is soft mottled stock with a warm tint,
   * "fiber" is directional paper fibre. Default "grain".
   */
  variant?: GrainVariant
  /** Layer opacity, 0 to 1. Defaults per variant. */
  opacity?: number
  /** Noise frequency. Higher is finer. A pair gives different x/y frequencies. Defaults per variant. */
  frequency?: number | [number, number]
  /** Turbulence octaves. More octaves add finer detail. Defaults per variant. */
  octaves?: number
  /** Noise seed, so two overlays can differ or match. Default 2. */
  seed?: number
  /** Tile size in px. Defaults per variant. */
  size?: number
  /** Tint the noise with a colour. When omitted, neutral luminance noise is used. */
  color?: string
  /** CSS mix-blend-mode. Defaults per variant. */
  blend?: React.CSSProperties["mixBlendMode"]
  /** Cover the viewport instead of the nearest positioned ancestor. Default false. */
  fixed?: boolean
  /** Subtle film flicker. Honours prefers-reduced-motion. Default false. */
  animate?: boolean
}

const presets: Record<
  GrainVariant,
  {
    frequency: number | [number, number]
    octaves: number
    opacity: number
    blend: React.CSSProperties["mixBlendMode"]
    size: number
    tint?: string
  }
> = {
  grain: { frequency: 0.85, octaves: 2, opacity: 0.22, blend: "overlay", size: 256 },
  paper: {
    frequency: 0.045,
    octaves: 5,
    opacity: 0.45,
    blend: "multiply",
    size: 512,
    tint: "rgba(221, 205, 172, 0.22)",
  },
  fiber: { frequency: [0.012, 0.65], octaves: 3, opacity: 0.35, blend: "multiply", size: 512 },
}

/** Builds a tiling SVG noise texture as a CSS url(). `asMask` keeps the colour channels for use as a mask. */
export function noiseTexture({
  frequency,
  octaves,
  seed,
  size,
  asMask = false,
}: {
  frequency: number | [number, number]
  octaves: number
  seed: number
  size: number
  asMask?: boolean
}) {
  const bf = Array.isArray(frequency) ? frequency.join(" ") : String(frequency)
  const desaturate = asMask ? "" : "<feColorMatrix type='saturate' values='0'/>"
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}'>` +
    `<filter id='n' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='${bf}' numOctaves='${octaves}' seed='${seed}' stitchTiles='stitch'/>` +
    desaturate +
    `</filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
}

/**
 * A pointer-transparent noise or paper-texture layer. Drop it inside any
 * `relative` section (or set `fixed` for the whole page). Server-component safe.
 */
export function GrainOverlay({
  variant = "grain",
  opacity,
  frequency,
  octaves,
  seed = 2,
  size,
  color,
  blend,
  fixed = false,
  animate = false,
  className,
  style,
  ...props
}: GrainOverlayProps) {
  const preset = presets[variant]
  const texture = noiseTexture({
    frequency: frequency ?? preset.frequency,
    octaves: octaves ?? preset.octaves,
    seed,
    size: size ?? preset.size,
    asMask: Boolean(color),
  })
  const tile = `${size ?? preset.size}px ${size ?? preset.size}px`

  const layer: React.CSSProperties = color
    ? {
        backgroundColor: color,
        WebkitMaskImage: texture,
        maskImage: texture,
        WebkitMaskSize: tile,
        maskSize: tile,
      }
    : {
        backgroundColor: preset.tint,
        backgroundImage: texture,
        backgroundSize: tile,
      }

  return (
    <div
      aria-hidden
      data-slot="grain-overlay"
      data-variant={variant}
      className={cn(
        "pointer-events-none select-none",
        fixed ? "fixed z-50" : "absolute",
        animate ? "-inset-[10%]" : "inset-0",
        className
      )}
      style={{
        opacity: opacity ?? preset.opacity,
        mixBlendMode: blend ?? preset.blend,
        animation: animate ? "cui-grain 0.7s steps(1) infinite" : undefined,
        ...layer,
        ...style,
      }}
      {...props}
    >
      {animate && (
        <style>{`@keyframes cui-grain{0%{transform:translate(0,0)}12%{transform:translate(-3%,2%)}25%{transform:translate(2%,-4%)}37%{transform:translate(-4%,-2%)}50%{transform:translate(3%,3%)}62%{transform:translate(-2%,4%)}75%{transform:translate(4%,-1%)}87%{transform:translate(-1%,-3%)}100%{transform:translate(0,0)}}@media (prefers-reduced-motion:reduce){[data-slot=grain-overlay]{animation:none!important}}`}</style>
      )}
    </div>
  )
}
