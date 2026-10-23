import * as React from "react"

import { cn } from "@/lib/utils"

export type CollageShape = "arch" | "oval" | "torn" | "museum" | "plain"

export interface CollageFrameProps extends Omit<React.ComponentProps<"div">, "children"> {
  /** Image URL. */
  src: string
  /** Accessible description. Leave empty for decorative images. */
  alt?: string
  /** Cut-out shape. Default "arch". */
  shape?: CollageShape
  /** Rotation in degrees, for a pasted-down collage feel. Default 0. */
  tilt?: number
  /** Soft drop shadow under the cut-out. Default true. */
  shadow?: boolean
  /** Torn edge roughness, 0 to 1. Default 0.5. */
  roughness?: number
  /** Seed for the torn edge, so two frames can differ. Default 7. */
  seed?: number
  /** Paper colour that shows along a torn edge. Default "#f4efe6". */
  paperColor?: string
  /** Museum frame colour. Default "#2a2420" (dark walnut). Try "#b08d4a" for gilt. */
  frameColor?: string
  /** Museum mat colour. Default "#f3efe7". */
  matColor?: string
  /** Museum frame thickness in px. Default 18. */
  frameWidth?: number
  /** Museum mat thickness in px. Default 24. */
  matWidth?: number
  /** How the image fills the cut-out. Default "cover". */
  fit?: "cover" | "contain"
  /** Class names for the img element. */
  imageClassName?: string
  /** Overlay content, usually one or more CollageFrameOverlay elements. */
  children?: React.ReactNode
}

/** SVG mask with a displaced (torn) edge. `inset` is in viewBox units out of 1000. */
function tornMask(seed: number, roughness: number, inset: number) {
  const r = Math.min(1, Math.max(0, roughness))
  const scale = 20 + r * 70
  const bf = (0.006 + r * 0.016).toFixed(4)
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1000 1000' preserveAspectRatio='none'>` +
    `<filter id='t' x='0' y='0' width='1000' height='1000' filterUnits='userSpaceOnUse'>` +
    `<feTurbulence type='fractalNoise' baseFrequency='${bf}' numOctaves='4' seed='${seed}'/>` +
    `<feDisplacementMap in='SourceGraphic' scale='${scale}' xChannelSelector='R' yChannelSelector='G'/>` +
    `</filter>` +
    `<rect x='${inset}' y='${inset}' width='${1000 - inset * 2}' height='${1000 - inset * 2}' fill='#000' filter='url(#t)'/>` +
    `</svg>`
  return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`
}

function maskStyle(mask: string): React.CSSProperties {
  return {
    WebkitMaskImage: mask,
    maskImage: mask,
    WebkitMaskSize: "100% 100%",
    maskSize: "100% 100%",
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
  }
}

/**
 * An image cut out as an arch, oval, torn paper or museum frame, with room to layer
 * UI on top. Size it with className (width plus a height or aspect ratio).
 */
export function CollageFrame({
  src,
  alt = "",
  shape = "arch",
  tilt = 0,
  shadow = true,
  roughness = 0.5,
  seed = 7,
  paperColor = "#f4efe6",
  frameColor = "#2a2420",
  matColor = "#f3efe7",
  frameWidth = 18,
  matWidth = 24,
  fit = "cover",
  imageClassName,
  className,
  style,
  children,
  ...props
}: CollageFrameProps) {
  const img = (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      draggable={false}
      className={cn("block size-full", fit === "cover" ? "object-cover" : "object-contain", imageClassName)}
    />
  )

  const softShadow = shadow ? "shadow-[0_24px_48px_-16px_rgba(0,0,0,0.45)]" : undefined

  let picture: React.ReactNode
  switch (shape) {
    case "oval":
      picture = <div className={cn("size-full overflow-hidden rounded-[50%]", softShadow)}>{img}</div>
      break
    case "plain":
      picture = <div className={cn("size-full overflow-hidden", softShadow)}>{img}</div>
      break
    case "torn": {
      const edge = 40 + roughness * 40
      picture = (
        <div
          className="size-full"
          style={shadow ? { filter: "drop-shadow(0 18px 28px rgba(0,0,0,0.35))" } : undefined}
        >
          <div className="relative size-full">
            <div
              aria-hidden
              className="absolute inset-0"
              style={{ backgroundColor: paperColor, ...maskStyle(tornMask(seed, roughness, edge)) }}
            />
            <div className="absolute inset-0" style={maskStyle(tornMask(seed, roughness, edge + 9))}>
              {img}
            </div>
          </div>
        </div>
      )
      break
    }
    case "museum":
      picture = (
        <div
          className={cn("size-full", softShadow)}
          style={{
            padding: frameWidth,
            background: `linear-gradient(145deg, color-mix(in srgb, ${frameColor} 78%, white) 0%, ${frameColor} 38%, ${frameColor} 62%, color-mix(in srgb, ${frameColor} 70%, black) 100%)`,
            boxShadow: `inset 0 0 0 1px color-mix(in srgb, ${frameColor} 60%, white), inset 0 0 0 ${frameWidth - 2}px transparent, inset 0 0 0 ${frameWidth - 1}px rgba(0,0,0,0.35)`,
          }}
        >
          <div
            className="size-full"
            style={{
              padding: matWidth,
              backgroundColor: matColor,
              boxShadow: "inset 0 1px 3px rgba(0,0,0,0.25), inset 0 0 0 1px rgba(0,0,0,0.06)",
            }}
          >
            <div className="size-full overflow-hidden shadow-[inset_0_2px_8px_rgba(0,0,0,0.35)]">{img}</div>
          </div>
        </div>
      )
      break
    case "arch":
    default:
      picture = <div className={cn("size-full overflow-hidden rounded-t-full", softShadow)}>{img}</div>
  }

  return (
    <div
      data-slot="collage-frame"
      data-shape={shape}
      className={cn("relative", className)}
      style={{ rotate: tilt ? `${tilt}deg` : undefined, ...style }}
      {...props}
    >
      {picture}
      {children}
    </div>
  )
}

export type CollageOverlayPosition =
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "bottom"
  | "center"

const positions: Record<CollageOverlayPosition, string> = {
  "top-left": "top-0 left-0 -translate-x-[var(--hang)] -translate-y-[var(--hang)]",
  "top-right": "top-0 right-0 translate-x-[var(--hang)] -translate-y-[var(--hang)]",
  "bottom-left": "bottom-0 left-0 -translate-x-[var(--hang)] translate-y-[var(--hang)]",
  "bottom-right": "right-0 bottom-0 translate-x-[var(--hang)] translate-y-[var(--hang)]",
  bottom: "bottom-0 left-1/2 -translate-x-1/2 translate-y-[var(--hang)]",
  center: "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
}

export interface CollageFrameOverlayProps extends React.ComponentProps<"div"> {
  /** Where the overlay sits on the frame. Default "bottom-left". */
  position?: CollageOverlayPosition
  /** How far the overlay hangs past the frame edge, in px. Default 24. Use 0 to keep it inside. */
  hang?: number
  /** Counter-rotation in degrees, e.g. the negative of the frame tilt to keep UI level. Default 0. */
  tilt?: number
}

/** Positions a card or any UI element on top of a CollageFrame. */
export function CollageFrameOverlay({
  position = "bottom-left",
  hang = 24,
  tilt = 0,
  className,
  style,
  ...props
}: CollageFrameOverlayProps) {
  return (
    <div
      data-slot="collage-frame-overlay"
      className={cn("absolute z-10 max-w-[88%]", positions[position], className)}
      style={
        {
          "--hang": `${hang}px`,
          rotate: tilt ? `${tilt}deg` : undefined,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}
