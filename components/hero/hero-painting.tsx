import { HalftoneImage } from "@/registry/new-york/blocks/halftone-image/halftone-image"

const ART = "/art/atelier-collage.webp"

/* The hero painting: three figures composing a layout from floating panels and frames,
   printed across the whole stage as a halftone engraving. Wide and full-bleed, anchored to
   the bottom edge. The box centres itself with `left`, not `translate`, because .hero-depth
   owns `translate`. */
const BOX =
  "hero-depth absolute bottom-0 left-[calc(50%-var(--w)/2)] aspect-[1376/768] w-[var(--w)] [--w:max(100vw,150svh)] md:[--w:max(100vw,125svh)]"
const BOX_STYLE = { "--depth": 0.18 } as React.CSSProperties

/** Engraving: ink on paper in light mode, a pale negative on ink in dark. */
export function HeroPainting() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className={BOX} style={BOX_STYLE}>
        <HalftoneImage
          src={ART}
          dotSize={4.5}
          angle={32}
          contrast={1.25}
          gain={1.05}
          color="currentColor"
          className="hero-engraving absolute inset-0 size-full text-[#241d17] dark:text-[#e3d7c0]"
          style={{ aspectRatio: "auto" }}
        />
      </div>
    </div>
  )
}
