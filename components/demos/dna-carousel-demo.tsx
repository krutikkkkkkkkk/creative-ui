"use client"

import * as React from "react"

import { DnaCarousel } from "@/registry/new-york/blocks/dna-carousel/dna-carousel"
import { DemoControls, DemoPanel, DemoStage, Range, Toggle } from "./controls"

const images = [
  { src: "/demo/venus.jpg", alt: "The Birth of Venus" },
  { src: "/demo/bust.jpg", alt: "Marble bust" },
  { src: "/demo/painting.jpg", alt: "Classical painting" },
  { src: "/demo/portrait.jpg", alt: "Portrait" },
]

export function DnaCarouselDemo() {
  const [depth, setDepth] = React.useState(260)
  const [spread, setSpread] = React.useState(70)
  const [curve, setCurve] = React.useState(24)
  const [rotation, setRotation] = React.useState(22)
  const [tilt, setTilt] = React.useState(-6)
  const [blur, setBlur] = React.useState(1.5)
  const [rgbSplit, setRgbSplit] = React.useState(1.5)
  const [autoplay, setAutoplay] = React.useState(true)
  const [index, setIndex] = React.useState(0)

  return (
    <DemoPanel className="max-w-4xl">
      <DemoStage className="flex-col gap-2">
        <DnaCarousel
          images={images}
          aria-label="Classical artworks"
          depth={depth}
          spread={spread}
          curve={curve}
          rotation={rotation}
          tilt={tilt}
          blur={blur}
          rgbSplit={rgbSplit}
          autoplay={autoplay}
          onIndexChange={setIndex}
          className="h-[420px] w-full rounded-xl"
        />
        <p className="font-mono text-[10px] text-muted-foreground">
          {images[index].alt} · {index + 1}/{images.length} · drag, scroll or use arrow keys
        </p>
      </DemoStage>
      <DemoControls>
        <Range label="Depth" value={depth} onChange={setDepth} min={0} max={600} step={10} format={(v) => `${v}px`} />
        <Range label="Helix spread" value={spread} onChange={setSpread} min={0} max={160} format={(v) => `${v}px`} />
        <Range label="Curve" value={curve} onChange={setCurve} min={-90} max={90} format={(v) => `${v}°`} />
        <Range label="Rotation" value={rotation} onChange={setRotation} min={0} max={60} format={(v) => `${v}°`} />
        <Range label="Tilt" value={tilt} onChange={setTilt} min={-30} max={30} format={(v) => `${v}°`} />
        <Range label="Blur" value={blur} onChange={setBlur} min={0} max={6} step={0.5} format={(v) => `${v}px`} />
        <Range label="RGB split" value={rgbSplit} onChange={setRgbSplit} min={0} max={6} step={0.5} format={(v) => `${v}px`} />
        <Toggle label="Autoplay" checked={autoplay} onChange={setAutoplay} />
      </DemoControls>
    </DemoPanel>
  )
}
