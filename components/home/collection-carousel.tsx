"use client"

import * as React from "react"
import { getImageProps } from "next/image"

import { DnaCarousel } from "@/registry/new-york/blocks/dna-carousel/dna-carousel"

const ART = [
  { src: "/art/arch-laurel.webp", alt: "A hand sets a carved marble keystone into an arch" },
  { src: "/art/bust-headphones.webp", alt: "Marble bust of a Roman woman wearing white headphones" },
  { src: "/art/owl-keyboard.webp", alt: "An owl perched on a cream mechanical keyboard" },
  { src: "/art/muse-phone.webp", alt: "A woman in a white classical gown reading a smartphone" },
  { src: "/art/sorting-prints.webp", alt: "A woman sorts prints at a desk" },
  { src: "/art/statue-tablet.webp", alt: "A marble youth drawing on a black tablet with a stylus" },
  { src: "/art/printing-press.webp", alt: "A printmaker pulls a website wireframe from a wooden press" },
  { src: "/art/scholar-laptop.webp", alt: "A woman in a white gown types on a halftone laptop" },
  { src: "/art/cherub-swatches.webp", alt: "A cherub holding a paintbrush and a fan of colour swatches" },
  { src: "/art/weaver-cable.webp", alt: "A woman at a spinning wheel spins thread into a white cable" },
  { src: "/art/laureate-laptop.webp", alt: "A marble statue with a laurel wreath holding a black laptop" },
  { src: "/art/architect-compass.webp", alt: "An architect's hands with a brass compass over an inked interface grid" },
  { src: "/art/sculptor-chisel.webp", alt: "A sculptor's hands with chisel and mallet at a marble face" },
  { src: "/art/still-life-keyboard.webp", alt: "Still life with grapes, oranges, a pewter jug and a keyboard" },
  { src: "/art/philosopher-mouse.webp", alt: "An old philosopher studies a white computer mouse in his palm" },
  { src: "/art/hands-card.webp", alt: "Hands in red velvet presenting a blank marble card" },
]

// Resized by next/image instead of the 928px originals. getImageProps' `src` is the 2x candidate,
// so 192 gives a 384px image: sharp on the 220px cards at the densities phones report.
const IMAGES = ART.map(({ src, alt }) => ({
  src: getImageProps({ src, alt, width: 192, height: 262 }).props.src,
  alt,
}))

/** The home page showcase of the DNA carousel: drag, scroll or use the arrow keys. */
export function CollectionCarousel() {
  const [index, setIndex] = React.useState(0)
  return (
    <div className="flex flex-col items-center gap-3">
      <DnaCarousel
        images={IMAGES}
        aria-label="Artworks from the collection"
        depth={300}
        spread={80}
        curve={26}
        rotation={24}
        tilt={-6}
        blur={1.5}
        inactiveOpacity={0.75}
        autoplay
        autoplaySpeed={0.12}
        onIndexChange={setIndex}
        className="h-[380px] w-full sm:h-[460px]"
      />
      <p className="font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase" aria-live="polite">
        {IMAGES[index]?.alt} · {index + 1}/{IMAGES.length} · drag, scroll or use arrow keys
      </p>
    </div>
  )
}
