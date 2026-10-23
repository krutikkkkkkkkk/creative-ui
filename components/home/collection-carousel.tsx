"use client"

import * as React from "react"

import { DnaCarousel } from "@/registry/new-york/blocks/dna-carousel/dna-carousel"

const IMAGES = [
  { src: "/art/arch-laurel.webp", alt: "A hand sets a carved marble keystone into an arch" },
  { src: "/demo/portrait.jpg", alt: "Girl with a Pearl Earring" },
  { src: "/art/sorting-prints.webp", alt: "A woman sorts prints at a desk" },
  { src: "/demo/bust.jpg", alt: "Marble bust of Hadrian" },
  { src: "/art/scholar-laptop.webp", alt: "A woman in a white gown types on a halftone laptop" },
  { src: "/demo/venus.jpg", alt: "The Birth of Venus" },
  { src: "/art/sculptor-chisel.webp", alt: "A sculptor's hands with chisel and mallet at a marble face" },
  { src: "/demo/painting.jpg", alt: "The Death of Socrates" },
]

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
