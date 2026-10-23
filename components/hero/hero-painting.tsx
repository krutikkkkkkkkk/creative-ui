import Image from "next/image"

import { HalftoneImage } from "@/registry/new-york/blocks/halftone-image/halftone-image"

const ART = "/art/arch-laurel.webp"
const ALT = "Oil painting of a hand setting a carved marble keystone into a stone arch"

/**
 * The hero painting, printed across the whole stage as a halftone engraving.
 * Under the lens (see HeroStage) the engraving gives way to the oil painting
 * in full colour, like a restorer lifting old varnish. Both layers sit in the
 * same box with the same cover fit, so they line up to the pixel.
 */
/* Both layers share this box, so the engraving and the painting line up to the pixel.
   The box centres itself with `left`, not `translate`, because .hero-depth owns `translate`. */
const BOX =
  "hero-depth absolute bottom-[-10%] left-[calc(50%-var(--w)/2)] aspect-[4/5] w-[var(--w)] [--w:clamp(460px,125vw,640px)] md:bottom-[-42%] md:[--w:clamp(620px,110svh,1140px)] [mask-image:linear-gradient(to_right,transparent,black_14%,black_86%,transparent)]"
const BOX_STYLE = { "--depth": 0.18 } as React.CSSProperties

export function HeroPainting() {
  return (
    <>
      {/* Engraving: ink on paper in light mode, a pale negative on ink in dark. */}
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

      {/* The real painting, in the same box, cut to the lens. The mask lives on this
          stage-sized layer so --mx/--my (stage px) land exactly under the pointer. */}
      <div aria-hidden className="hero-lens pointer-events-none absolute inset-0 -z-10">
        <div className={BOX} style={BOX_STYLE}>
          <Image src={ART} alt={ALT} fill priority sizes="1240px" className="object-cover" />
        </div>
      </div>
    </>
  )
}

/** The lens itself: a thin gold ring with ticks, a slow dashed orbit and a readout. */
export function HeroLens() {
  return (
    <div aria-hidden className="hero-lens-ring">
      <span className="hero-lens-orbit absolute inset-[-6px] rounded-full border border-dashed border-[#B8893A]/45" />
      <span className="absolute inset-0 rounded-full border border-[#B8893A]/70 shadow-[inset_0_0_80px_-30px_rgba(184,137,58,0.45)]" />
      {/* Ticks */}
      <span className="absolute top-0 left-1/2 h-3 w-px -translate-x-1/2 -translate-y-1/2 bg-[#B8893A]" />
      <span className="absolute bottom-0 left-1/2 h-3 w-px -translate-x-1/2 translate-y-1/2 bg-[#B8893A]" />
      <span className="absolute top-1/2 left-0 h-px w-3 -translate-x-1/2 -translate-y-1/2 bg-[#B8893A]" />
      <span className="absolute top-1/2 right-0 h-px w-3 translate-x-1/2 -translate-y-1/2 bg-[#B8893A]" />
      {/* Centre mark */}
      <span className="absolute top-1/2 left-1/2 size-1 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#B8893A]" />
      {/* Readout */}
      <span className="absolute top-[calc(50%+var(--lens)*0.74)] left-[calc(50%+var(--lens)*0.74)] hidden font-mono sm:block text-[10px] tracking-[.08em] whitespace-nowrap text-[#B8893A] uppercase">
        <span className="hero-lens-idle">{"// "}scanning</span>
        <span className="hero-lens-live">{"// "}restored</span>
      </span>
    </div>
  )
}
