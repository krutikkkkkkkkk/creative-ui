import type { Metadata } from "next"

import { demoImages } from "@/lib/demo-images"
import { CollageFrame, CollageFrameOverlay } from "@/registry/new-york/blocks/collage-frame/collage-frame"
import { DuotoneImage } from "@/registry/new-york/blocks/duotone-image/duotone-image"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"
import { HalftoneImage } from "@/registry/new-york/blocks/halftone-image/halftone-image"

const card = (
  <div className="w-40 rounded-xl border border-black/10 bg-white p-3 text-xs text-black shadow-xl">
    <p className="font-mono text-[10px] tracking-widest uppercase opacity-60">Lot 17</p>
    <p className="mt-1 font-serif text-base">Pre-Raphaelite school</p>
  </div>
)

/* Internal visual test bench, kept out of search. */
export const metadata: Metadata = { title: "Shape test", robots: { index: false, follow: false } }

export default function ShapeTest() {
  return (
    <div className="min-h-screen bg-[#f6f2ea] p-8 text-[#15130f]">
      <h2 className="mb-3 font-mono text-xs">collage-frame: torn 0.2 / torn 0.6 / torn 1.0 / museum / museum gilt / oval</h2>
      <div className="flex flex-wrap items-start gap-10">
        <CollageFrame src={demoImages.portrait.src} shape="torn" roughness={0.2} className="aspect-[4/5] w-44" />
        <CollageFrame src={demoImages.portrait.src} shape="torn" roughness={0.6} tilt={-3} className="aspect-[4/5] w-44">
          <CollageFrameOverlay position="bottom-right" tilt={3}>{card}</CollageFrameOverlay>
        </CollageFrame>
        <CollageFrame src={demoImages.portrait.src} shape="torn" roughness={1} seed={3} className="aspect-[4/5] w-44" />
        <CollageFrame src={demoImages.portrait.src} shape="museum" className="aspect-[4/5] w-48" />
        <CollageFrame src={demoImages.pastoral.src} shape="museum" frameColor="#b08d4a" matColor="#fbf7ee" className="aspect-[3/2] w-64" />
        <CollageFrame src={demoImages.statue.src} shape="oval" tilt={2} className="aspect-[4/5] w-44">
          <CollageFrameOverlay position="top-left" hang={12}>{card}</CollageFrameOverlay>
        </CollageFrame>
      </div>

      <h2 className="mt-10 mb-3 font-mono text-xs">halftone-image (light): dot / line 15° / square / contain + bg / blue ink 8px</h2>
      <div className="flex flex-wrap items-start gap-6">
        <HalftoneImage src={demoImages.statue.src} className="aspect-[4/5] w-44" />
        <HalftoneImage src={demoImages.statue.src} shape="line" angle={15} dotSize={5} className="aspect-[4/5] w-44" />
        <HalftoneImage src={demoImages.statue.src} shape="square" angle={0} className="aspect-[4/5] w-44" />
        <HalftoneImage src={demoImages.pastoral.src} fit="contain" background="#fff" dotSize={4} className="aspect-[4/5] w-44" />
        <HalftoneImage src={demoImages.portrait.src} color="#1d3fb0" dotSize={8} contrast={1.3} className="aspect-[4/5] w-44" />
      </div>

      <h2 className="mt-10 mb-3 font-mono text-xs">grain-overlay (light): none / grain / paper / fiber / tinted gold</h2>
      <div className="flex flex-wrap gap-4">
        {(["none", "grain", "paper", "fiber", "tint"] as const).map((v) => (
          <div key={v} className="relative h-40 w-52 overflow-hidden rounded-xl border border-black/10 bg-[#f6f1e7] p-4">
            <p className="font-serif text-xl">Printed, not pixels.</p>
            <p className="mt-1 text-xs opacity-70">{v}</p>
            {v === "tint" ? (
              <GrainOverlay variant="grain" color="#b08d4a" opacity={0.6} />
            ) : v !== "none" ? (
              <GrainOverlay variant={v} />
            ) : null}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        {(["none", "grain", "paper", "fiber", "tint"] as const).map((v) => (
          <div key={v} className="relative h-40 w-52 overflow-hidden rounded-xl border border-white/10 bg-[#1a1714] p-4 text-[#f1ebe0]">
            <p className="font-serif text-xl">Printed, not pixels.</p>
            <p className="mt-1 text-xs opacity-70">{v} (dark)</p>
            {v === "tint" ? (
              <GrainOverlay variant="grain" color="#b08d4a" opacity={0.6} />
            ) : v !== "none" ? (
              <GrainOverlay variant={v} />
            ) : null}
          </div>
        ))}
      </div>

      <h2 className="mt-10 mb-3 font-mono text-xs">duotone-image: newsprint / cyanotype offset 6 / fluoro mix .6 / sepia / custom</h2>
      <div className="flex flex-wrap gap-4">
        <DuotoneImage src={demoImages.lakeside.src} preset="newsprint" className="aspect-[3/2] w-56 rounded-lg" />
        <DuotoneImage src={demoImages.lakeside.src} preset="cyanotype" offset={6} className="aspect-[3/2] w-56 rounded-lg" />
        <DuotoneImage src={demoImages.lakeside.src} preset="fluoro" mix={0.6} className="aspect-[3/2] w-56 rounded-lg" />
        <DuotoneImage src={demoImages.portrait.src} preset="sepia" className="aspect-[3/2] w-56 rounded-lg" />
        <DuotoneImage src={demoImages.statue.src} shadow="rgb(20, 60, 40)" highlight="#ffd166" className="aspect-[3/2] w-56 rounded-lg" />
      </div>
    </div>
  )
}
