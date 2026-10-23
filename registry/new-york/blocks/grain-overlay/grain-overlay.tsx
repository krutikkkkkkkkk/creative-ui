import * as React from "react"

import { cn } from "@/lib/utils"

export type GrainVariant = "grain" | "paper" | "fiber"

export interface GrainOverlayProps extends Omit<React.ComponentProps<"div">, "color"> {
  /**
   * "grain" is fine film grain, "paper" is warm stock with soft mottling and tooth,
   * "fiber" is handmade paper with loose strands. Default "grain".
   */
  variant?: GrainVariant
  /** Layer opacity, 0 to 1. Defaults per variant. */
  opacity?: number
  /** Frequency of the variant's main noise. Higher is finer. A pair gives different x/y frequencies. */
  frequency?: number | [number, number]
  /** Octaves of the variant's main noise. More octaves add finer detail. */
  octaves?: number
  /** How hard the specks are cut from the noise. Higher is crisper and stronger. Defaults per variant. */
  contrast?: number
  /** Noise seed, so two overlays can differ or match. Default 2. */
  seed?: number
  /** Tile size in px. Defaults per variant. */
  size?: number
  /** Paint the specks in one colour (any CSS colour, including variables). Default: dark and light specks. */
  color?: string
  /** CSS mix-blend-mode. Default "normal", which reads on light, dark and photographic surfaces alike. */
  blend?: React.CSSProperties["mixBlendMode"]
  /** Cover the viewport instead of the nearest positioned ancestor. Default false. */
  fixed?: boolean
  /** Film flicker: the grain jumps a few frames a second. Still for prefers-reduced-motion. Default false. */
  animate?: boolean
}

type Rgb = [number, number, number]

interface NoiseLayer {
  type: "fractalNoise" | "turbulence"
  frequency: number | [number, number]
  octaves: number
  contrast: number
  /**
   * "specks" splits mid-grey noise into dark specks below the middle and light specks above it.
   * "strands" keeps only the thin valleys of turbulence noise, which read as fibres.
   */
  shape: "specks" | "strands"
  /** Strands only: peak alpha, so fine strands can sit behind coarse ones. */
  strength?: number
  /** Strands only: frequency of a patchy mask that cuts the strand network into short fibres. */
  breakup?: number
  seedOffset?: number
}

interface GrainPreset {
  size: number
  opacity: number
  ink: Rgb
  light: Rgb
  /** A mid tone, so strands read on light and dark surfaces. */
  strand: Rgb
  /** The first layer is the main one that `frequency`, `octaves` and `contrast` adjust. */
  layers: NoiseLayer[]
}

const neutral = { ink: [0, 0, 0] as Rgb, light: [1, 1, 1] as Rgb, strand: [0.5, 0.5, 0.5] as Rgb }
const warm = { ink: [0.24, 0.17, 0.09] as Rgb, light: [1, 0.98, 0.93] as Rgb, strand: [0.5, 0.45, 0.38] as Rgb }
const tooth: NoiseLayer = { type: "fractalNoise", frequency: 0.9, octaves: 3, contrast: 1.8, shape: "specks", seedOffset: 1 }

export const grainPresets: Record<GrainVariant, GrainPreset> = {
  grain: {
    size: 240,
    opacity: 0.25,
    ...neutral,
    layers: [{ type: "fractalNoise", frequency: 0.85, octaves: 4, contrast: 2.2, shape: "specks" }],
  },
  paper: {
    size: 480,
    opacity: 0.45,
    ...warm,
    layers: [tooth, { type: "fractalNoise", frequency: 0.012, octaves: 4, contrast: 0.5, shape: "specks" }],
  },
  fiber: {
    size: 480,
    opacity: 0.5,
    ...warm,
    layers: [
      { type: "turbulence", frequency: 0.03, octaves: 1, contrast: 28, shape: "strands", strength: 0.9, breakup: 0.025 },
      {
        type: "turbulence",
        frequency: 0.07,
        octaves: 1,
        contrast: 30,
        shape: "strands",
        strength: 0.6,
        breakup: 0.04,
        seedOffset: 3,
      },
      { ...tooth, contrast: 1.6 },
    ],
  },
}

const n = (value: number) => Number(value.toFixed(4))
const rgbRows = ([r, g, b]: Rgb) => `0 0 0 0 ${n(r)} 0 0 0 0 ${n(g)} 0 0 0 0 ${n(b)}`

/**
 * Builds a tiling SVG noise texture as a CSS url(). Each pixel is transparent or a dark or light speck,
 * so it needs no blend mode. The alpha channel carries the texture, which also makes it a ready mask.
 */
export function noiseTexture({
  variant = "grain",
  frequency,
  octaves,
  contrast,
  seed = 2,
  size,
}: {
  variant?: GrainVariant
  frequency?: number | [number, number]
  octaves?: number
  contrast?: number
  seed?: number
  size?: number
  /** @deprecated The texture always works as a mask now. */
  asMask?: boolean
}) {
  const preset = grainPresets[variant]
  const tile = size ?? preset.size
  const [main, ...rest] = preset.layers
  const layers = [
    { ...main, frequency: frequency ?? main.frequency, octaves: octaves ?? main.octaves, contrast: contrast ?? main.contrast },
    ...rest,
  ]

  let primitives = ""
  const results: string[] = []
  layers.forEach((layer, i) => {
    const bf = Array.isArray(layer.frequency) ? layer.frequency.join(" ") : layer.frequency
    const k = layer.contrast
    const layerSeed = seed + (layer.seedOffset ?? 0)
    primitives += `<feTurbulence type='${layer.type}' baseFrequency='${bf}' numOctaves='${layer.octaves}' seed='${layerSeed}' stitchTiles='stitch' result='t${i}'/>`
    if (layer.shape === "specks") {
      // Alpha rises as the red channel moves away from 0.5: below it paints ink, above it paints light.
      primitives +=
        `<feColorMatrix in='t${i}' type='matrix' values='${rgbRows(preset.ink)} ${n(-k)} 0 0 0 ${n(k / 2)}' result='d${i}'/>` +
        `<feColorMatrix in='t${i}' type='matrix' values='${rgbRows(preset.light)} ${n(k)} 0 0 0 ${n(-k / 2)}' result='l${i}'/>`
      results.push(`d${i}`, `l${i}`)
      return
    }
    // Turbulence dips to zero along thin ridges. Keep only those dips.
    primitives += `<feColorMatrix in='t${i}' type='matrix' values='${rgbRows(preset.strand)} ${n(-k)} 0 0 0 ${layer.strength ?? 1}' result='s${i}'/>`
    if (!layer.breakup) {
      results.push(`s${i}`)
      return
    }
    // Without a mask the ridges join into a marbled net. Patches of noise cut them into loose fibres.
    primitives +=
      `<feTurbulence type='fractalNoise' baseFrequency='${layer.breakup}' numOctaves='2' seed='${layerSeed + 7}' stitchTiles='stitch' result='m${i}'/>` +
      `<feColorMatrix in='m${i}' type='matrix' values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 5 0 0 0 -2.75' result='p${i}'/>` +
      `<feComposite in='s${i}' in2='p${i}' operator='in' result='f${i}'/>`
    results.push(`f${i}`)
  })

  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${tile}' height='${tile}'>` +
    `<filter id='g' x='0' y='0' width='100%' height='100%' color-interpolation-filters='sRGB'>` +
    primitives +
    `<feMerge>${results.map((r) => `<feMergeNode in='${r}'/>`).join("")}</feMerge>` +
    `</filter><rect width='100%' height='100%' filter='url(#g)'/></svg>`
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
}

// Eight held frames at about 10fps. steps(1) jumps between them, which is what film grain does.
const filmCss =
  "@keyframes cui-grain{0%{transform:translate(0,0)}12.5%{transform:translate(-3%,2%)}25%{transform:translate(2%,-4%)}37.5%{transform:translate(-4%,-1%)}50%{transform:translate(3%,3%)}62.5%{transform:translate(-2%,4%)}75%{transform:translate(4%,-2%)}87.5%{transform:translate(-1%,-3%)}}" +
  "[data-slot=grain-overlay-film]{animation:cui-grain .8s steps(1) infinite;will-change:transform}" +
  "@media (prefers-reduced-motion:reduce){[data-slot=grain-overlay-film]{animation:none;will-change:auto}}"

/**
 * A pointer-transparent film grain or paper texture. Drop it inside any `relative` section,
 * or set `fixed` for the whole page. No client JavaScript, so it is server-component safe.
 */
export function GrainOverlay({
  variant = "grain",
  opacity,
  frequency,
  octaves,
  contrast,
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
  const preset = grainPresets[variant]
  const tileSize = size ?? preset.size
  const texture = noiseTexture({ variant, frequency, octaves, contrast, seed, size: tileSize })
  const tile = `${tileSize}px ${tileSize}px`

  const surface: React.CSSProperties = color
    ? { backgroundColor: color, WebkitMaskImage: texture, maskImage: texture, WebkitMaskSize: tile, maskSize: tile }
    : { backgroundImage: texture, backgroundSize: tile }

  return (
    <div
      aria-hidden
      data-slot="grain-overlay"
      data-variant={variant}
      className={cn(
        "pointer-events-none inset-0 select-none print:hidden forced-colors:hidden",
        fixed ? "fixed z-50" : "absolute",
        animate && "overflow-hidden",
        className
      )}
      style={{
        opacity: opacity ?? preset.opacity,
        mixBlendMode: blend,
        ...(animate ? undefined : surface),
        ...style,
      }}
      {...props}
    >
      {animate && (
        <>
          <style href="cui-grain-overlay" precedence="medium">
            {filmCss}
          </style>
          {/* Oversized so the jumps never expose an edge; the parent clips it. */}
          <div data-slot="grain-overlay-film" className="absolute inset-[-6%]" style={surface} />
        </>
      )}
    </div>
  )
}
