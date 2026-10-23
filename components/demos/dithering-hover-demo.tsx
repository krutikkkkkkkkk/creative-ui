"use client"

import * as React from "react"

import { demoImages } from "@/lib/demo-images"
import { DitheringHover, type DitherMatrix } from "@/registry/new-york/blocks/dithering-hover/dithering-hover"
import { Choice, DemoControls, DemoPanel, DemoStage, Range, Swatches } from "./controls"

const images = [
  { value: "/demo/marble-bust.webp", label: "Bust" },
  { value: demoImages.portrait.src, label: "Portrait" },
  { value: demoImages.statue.src, label: "Statue" },
]

const inks = [
  { value: "#000000", label: "Black" },
  { value: "#1d3fb0", label: "Riso blue" },
  { value: "#7f1d1d", label: "Oxblood" },
  { value: "#14532d", label: "Forest" },
] as const

const papers = [
  { value: "#ffffff", label: "White" },
  { value: "#f5f2eb", label: "Cream" },
  { value: "#fde68a", label: "Yellow" },
  { value: "transparent", label: "Transparent" },
] as const

export function DitheringHoverDemo() {
  const [src, setSrc] = React.useState<string>(images[0].value)
  const [zoneSize, setZoneSize] = React.useState(200)
  const [dotSize, setDotSize] = React.useState(4)
  const [matrix, setMatrix] = React.useState<DitherMatrix>(8)
  const [streaks, setStreaks] = React.useState(28)
  const [roughness, setRoughness] = React.useState(0.6)
  const [contrast, setContrast] = React.useState(1.1)
  const [dark, setDark] = React.useState<string>(inks[0].value)
  const [light, setLight] = React.useState<string>(papers[0].value)
  const [mode, setMode] = React.useState<"inside" | "outside">("inside")

  return (
    <DemoPanel>
      <DemoStage className="flex-col gap-2">
        <DitheringHover
          src={src}
          alt="Classical artwork that dithers under the cursor"
          zoneSize={zoneSize}
          dotSize={dotSize}
          matrix={matrix}
          streaks={streaks}
          roughness={roughness}
          contrast={contrast}
          dark={dark}
          light={light}
          mode={mode}
          className="aspect-[4/5] w-full max-w-sm rounded-xl bg-black"
        />
        <p className="font-mono text-[10px] text-muted-foreground">move the pointer over the image</p>
      </DemoStage>
      <DemoControls>
        <Choice label="Image" value={src} options={images} onChange={setSrc} />
        <Choice
          label="Mode"
          value={mode}
          options={[
            { value: "inside", label: "Dither under cursor" },
            { value: "outside", label: "Reveal under cursor" },
          ]}
          onChange={setMode}
        />
        <Range label="Zone size" value={zoneSize} onChange={setZoneSize} min={60} max={500} step={10} format={(v) => `${v}px`} />
        <Range label="Dot size" value={dotSize} onChange={setDotSize} min={1} max={16} format={(v) => `${v}px`} />
        <Choice
          label="Matrix"
          value={String(matrix)}
          options={[
            { value: "2", label: "2×2" },
            { value: "4", label: "4×4" },
            { value: "8", label: "8×8" },
          ]}
          onChange={(v) => setMatrix(Number(v) as DitherMatrix)}
        />
        <Range label="Streaks" value={streaks} onChange={setStreaks} min={0} max={64} />
        <Range label="Roughness" value={roughness} onChange={setRoughness} min={0} max={1} step={0.05} format={(v) => v.toFixed(2)} />
        <Range label="Contrast" value={contrast} onChange={setContrast} min={0.5} max={2} step={0.1} format={(v) => v.toFixed(1)} />
        <Swatches label="Ink" value={dark} options={inks} onChange={setDark} />
        <Swatches label="Paper" value={light} options={papers} onChange={setLight} />
      </DemoControls>
    </DemoPanel>
  )
}
