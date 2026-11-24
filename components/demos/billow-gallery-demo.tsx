"use client"

import * as React from "react"

import { BillowGallery, type BillowGalleryItem } from "@/registry/new-york/blocks/billow-gallery/billow-gallery"
import { DemoControls, DemoPanel, DemoStage, Range, Swatches, Toggle } from "./controls"

const items: BillowGalleryItem[] = [
  { src: "/art/muse-phone.webp", alt: "A muse in a white gown reading her phone" },
  { src: "/demo/rotunda/tholos-ruin.webp", alt: "Ruined round temple at golden hour", aspect: 0.82 },
  { src: "/art/bust-headphones.webp", alt: "Marble bust wearing headphones" },
  { src: "/demo/portrait.jpg", alt: "Girl with a blue and gold headscarf" },
  { src: "/art/printing-press.webp", alt: "A printer pulling a sheet from a wooden press" },
  { src: "/demo/rotunda/pomegranate-still-life.webp", alt: "Pomegranates, figs and grapes in a bronze bowl", aspect: 0.9 },
  { src: "/art/scholar-laptop.webp", alt: "A woman in white typing on a laptop" },
  { src: "/art/cherub-swatches.webp", alt: "A cherub carrying a paintbrush and colour swatches" },
  { src: "/demo/rotunda/pantheon-oculus.webp", alt: "The Pantheon dome and oculus", aspect: 1 },
  { src: "/art/philosopher-mouse.webp", alt: "An old philosopher holding a computer mouse" },
  { src: "/demo/bust.jpg", alt: "Marble bust of a Roman emperor" },
  { src: "/art/weaver-cable.webp", alt: "A woman spinning cable on a spinning wheel" },
  { src: "/demo/rotunda/owl-on-capital.webp", alt: "Little owl on an Ionic capital", aspect: 0.8 },
  { src: "/art/sculptor-chisel.webp", alt: "A sculptor chiselling a face from marble" },
  { src: "/art/statue-tablet.webp", alt: "A seated statue drawing on a tablet" },
  { src: "/demo/rotunda/armillary-sphere.webp", alt: "Brass armillary sphere by candlelight", aspect: 0.86 },
  { src: "/art/owl-keyboard.webp", alt: "An owl perched on an old keyboard" },
  { src: "/art/laureate-laptop.webp", alt: "A marble athlete holding a laptop" },
]

const walls = [
  { value: "#e9ebef", label: "Mist" },
  { value: "#efe9dd", label: "Paper" },
  { value: "#1b1e23", label: "Ink" },
] as const

const shadows: Record<string, string> = {
  "#e9ebef": "#26303d",
  "#efe9dd": "#3b2a1a",
  "#1b1e23": "#000000",
}

export function BillowGalleryDemo() {
  const [wall, setWall] = React.useState("#e9ebef")
  const [bend, setBend] = React.useState(1)
  const [crest, setCrest] = React.useState(1)
  const [perspective, setPerspective] = React.useState(1100)
  const [drift, setDrift] = React.useState(18)
  const [columnWidth, setColumnWidth] = React.useState(240)
  const [shadow, setShadow] = React.useState(true)

  return (
    <DemoPanel className="max-w-4xl">
      <DemoStage className="flex-col gap-2">
        <BillowGallery
          items={items}
          aria-label="Classical artworks"
          bend={bend}
          crest={crest}
          perspective={perspective}
          drift={drift}
          columnWidth={columnWidth}
          shadow={shadow}
          shadowColor={shadows[wall]}
          className="h-[560px] w-full rounded-xl transition-colors duration-300"
          style={{ background: wall }}
        />
        <p className="font-mono text-[10px] text-muted-foreground">
          drag, flick or scroll the wall · arrow keys pan · hover to lift a print
        </p>
      </DemoStage>
      <DemoControls>
        <Swatches label="Wall" value={wall} options={walls} onChange={setWall} />
        <Range label="Bend" value={bend} onChange={setBend} min={0} max={2} step={0.05} format={(v) => v.toFixed(2)} />
        <Range label="Crest" value={crest} onChange={setCrest} min={0} max={2.5} step={0.05} format={(v) => v.toFixed(2)} />
        <Range
          label="Depth"
          value={perspective}
          onChange={setPerspective}
          min={500}
          max={2400}
          step={50}
          format={(v) => `${v}px`}
        />
        <Range label="Drift" value={drift} onChange={setDrift} min={0} max={80} format={(v) => `${v}px/s`} />
        <Range
          label="Card width"
          value={columnWidth}
          onChange={setColumnWidth}
          min={160}
          max={340}
          step={10}
          format={(v) => `${v}px`}
        />
        <Toggle label="Shadows" checked={shadow} onChange={setShadow} />
      </DemoControls>
    </DemoPanel>
  )
}
