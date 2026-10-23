"use client"

import * as React from "react"

import { RotundaCarousel } from "@/registry/new-york/blocks/rotunda-carousel/rotunda-carousel"
import { Choice, DemoControls, DemoPanel, DemoStage, Range, Toggle } from "./controls"

const items = [
  { src: "/demo/rotunda/goddess-bust.webp", alt: "Marble bust of a goddess by a window" },
  { src: "/demo/rotunda/tholos-ruin.webp", alt: "Ruined round temple at golden hour" },
  { src: "/demo/rotunda/armillary-sphere.webp", alt: "Brass armillary sphere by candlelight" },
  { src: "/demo/rotunda/amphora.webp", alt: "Black-figure Greek amphora on a plinth" },
  { src: "/demo/rotunda/muse-with-lyre.webp", alt: "Marble muse holding a lyre in a niche" },
  { src: "/demo/rotunda/pantheon-oculus.webp", alt: "The Pantheon dome and oculus" },
  { src: "/demo/rotunda/owl-on-capital.webp", alt: "Little owl on an Ionic capital" },
  { src: "/demo/rotunda/pomegranate-still-life.webp", alt: "Pomegranates, figs and grapes in a bronze bowl" },
]

const directions = [
  { value: "clockwise", label: "Clockwise" },
  { value: "counterclockwise", label: "Counter" },
] as const

const orientations = [
  { value: "upright", label: "Upright" },
  { value: "radial", label: "Radial" },
] as const

export function RotundaCarouselDemo() {
  const [radius, setRadius] = React.useState(240)
  const [maxSize, setMaxSize] = React.useState(150)
  const [minSize, setMinSize] = React.useState(56)
  const [taper, setTaper] = React.useState(1.4)
  const [focusAngle, setFocusAngle] = React.useState(180)
  const [cornerRadius, setCornerRadius] = React.useState(16)
  const [speed, setSpeed] = React.useState(10)
  const [hoverScale, setHoverScale] = React.useState(1.18)
  const [direction, setDirection] = React.useState<"clockwise" | "counterclockwise">("clockwise")
  const [orientation, setOrientation] = React.useState<"upright" | "radial">("upright")
  const [autoSpin, setAutoSpin] = React.useState(true)

  return (
    <DemoPanel className="max-w-4xl">
      <DemoStage className="flex-col gap-2">
        <RotundaCarousel
          items={items}
          aria-label="Classical artworks"
          radius={radius}
          maxSize={maxSize}
          minSize={minSize}
          taper={taper}
          focusAngle={focusAngle}
          cornerRadius={cornerRadius}
          speed={speed}
          hoverScale={hoverScale}
          direction={direction}
          orientation={orientation}
          autoSpin={autoSpin}
          className="h-[520px] w-full rounded-xl"
        />
        <p className="font-mono text-[10px] text-muted-foreground">
          drag around the ring, scroll or use arrow keys · hover to pause
        </p>
      </DemoStage>
      <DemoControls>
        <Range label="Radius" value={radius} onChange={setRadius} min={120} max={320} step={5} format={(v) => `${v}px`} />
        <Range label="Largest tile" value={maxSize} onChange={setMaxSize} min={80} max={220} step={2} format={(v) => `${v}px`} />
        <Range label="Smallest tile" value={minSize} onChange={setMinSize} min={20} max={160} step={2} format={(v) => `${v}px`} />
        <Range label="Taper" value={taper} onChange={setTaper} min={0.2} max={4} step={0.1} format={(v) => v.toFixed(1)} />
        <Range label="Focus angle" value={focusAngle} onChange={setFocusAngle} min={0} max={359} format={(v) => `${v}°`} />
        <Range label="Corners" value={cornerRadius} onChange={setCornerRadius} min={0} max={75} format={(v) => `${v}px`} />
        <Range label="Speed" value={speed} onChange={setSpeed} min={0} max={60} format={(v) => `${v}°/s`} />
        <Range label="Hover scale" value={hoverScale} onChange={setHoverScale} min={1} max={1.6} step={0.02} format={(v) => `${v.toFixed(2)}×`} />
        <Choice label="Direction" value={direction} options={directions} onChange={setDirection} />
        <Choice label="Tiles" value={orientation} options={orientations} onChange={setOrientation} />
        <Toggle label="Auto spin" checked={autoSpin} onChange={setAutoSpin} />
      </DemoControls>
    </DemoPanel>
  )
}
