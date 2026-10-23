import { HalftoneImage } from "@/registry/new-york/blocks/halftone-image/halftone-image"

const ART = "/art/arch-laurel.webp"

/* The hero painting, printed across the whole stage as a halftone engraving.
   The box centres itself with `left`, not `translate`, because .hero-depth owns `translate`. */
const BOX =
  "hero-depth absolute bottom-[-10%] left-[calc(50%-var(--w)/2)] aspect-[4/5] w-[var(--w)] [--w:clamp(460px,125vw,640px)] md:bottom-[-42%] md:[--w:clamp(620px,110svh,1140px)] [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]"
const BOX_STYLE = { "--depth": 0.18 } as React.CSSProperties

/** Engraving: ink on paper in light mode, a pale negative on ink in dark. */
export function HeroPainting() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      <div className={BOX} style={BOX_STYLE}>
        <HalftoneImage
          src={ART}
          dotSize={5}
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
