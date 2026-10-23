"use client"

import * as React from "react"

import { ImageTrail } from "@/registry/new-york/blocks/image-trail/image-trail"
import { Choice, DemoControls, DemoPanel, DemoStage, Range, Toggle } from "./controls"

const images = [
  { src: "/art/bust-headphones.webp", alt: "Marble bust wearing white headphones" },
  { src: "/art/muse-phone.webp", alt: "A woman in a classical gown reading a smartphone" },
  { src: "/art/owl-keyboard.webp", alt: "An owl perched on a mechanical keyboard" },
  { src: "/art/laureate-laptop.webp", alt: "A laurelled marble statue holding a laptop" },
  { src: "/art/cherub-swatches.webp", alt: "A cherub with a paintbrush and colour swatches" },
  { src: "/art/statue-tablet.webp", alt: "A marble youth drawing on a tablet" },
  { src: "/art/printing-press.webp", alt: "A printmaker pulling a wireframe from a press" },
  { src: "/art/philosopher-mouse.webp", alt: "A philosopher studying a computer mouse" },
]

const shapes = [
  { value: "portrait", label: "Portrait" },
  { value: "square", label: "Square" },
  { value: "landscape", label: "Landscape" },
] as const

type Shape = (typeof shapes)[number]["value"]

const cardClass: Record<Shape, string> = {
  portrait: "w-28 aspect-[4/5]",
  square: "w-28 aspect-square",
  landscape: "w-36 aspect-[4/3]",
}

export function ImageTrailDemo() {
  const [spacing, setSpacing] = React.useState(80)
  const [duration, setDuration] = React.useState(1500)
  const [tilt, setTilt] = React.useState(16)
  const [maxCards, setMaxCards] = React.useState(14)
  const [shape, setShape] = React.useState<Shape>("portrait")
  const [quiet, setQuiet] = React.useState(true)

  return (
    <DemoPanel>
      <DemoStage>
        <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl border bg-[#F4F2EE] dark:bg-muted/30">
          <ImageTrail
            images={images}
            spacing={spacing}
            duration={duration}
            tilt={tilt}
            maxCards={maxCards}
            cardClassName={cardClass[shape]}
          />
          <div
            data-trail-quiet={quiet || undefined}
            className="relative z-10 flex flex-col items-center gap-1 px-4 text-center"
          >
            <p className="font-serif text-2xl italic">Move your pointer</p>
            <p className="font-mono text-[10px] text-muted-foreground">
              {quiet ? "this label is a quiet zone" : "cards spawn everywhere"}
            </p>
          </div>
        </div>
      </DemoStage>
      <DemoControls>
        <Range label="Spacing" value={spacing} onChange={setSpacing} min={30} max={200} step={5} format={(v) => `${v}px`} />
        <Range label="Duration" value={duration} onChange={setDuration} min={600} max={3000} step={100} format={(v) => `${v}ms`} />
        <Range label="Tilt" value={tilt} onChange={setTilt} min={0} max={30} format={(v) => `${v}°`} />
        <Range label="Max cards" value={maxCards} onChange={setMaxCards} min={4} max={24} />
        <Choice label="Card shape" value={shape} options={shapes} onChange={setShape} />
        <Toggle label="Quiet zone" checked={quiet} onChange={setQuiet} />
      </DemoControls>
    </DemoPanel>
  )
}
