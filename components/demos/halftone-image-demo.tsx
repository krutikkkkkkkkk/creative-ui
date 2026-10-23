"use client"

import * as React from "react"
import { useTheme } from "next-themes"

import { demoImages } from "@/lib/demo-images"
import { HalftoneImage, type HalftoneShape } from "@/registry/new-york/blocks/halftone-image/halftone-image"
import { Choice, DemoControls, DemoPanel, DemoStage, Range, Swatches, Toggle } from "./controls"

const images = [
  { value: demoImages.statue.src, label: "Statue" },
  { value: demoImages.portrait.src, label: "Portrait" },
  { value: demoImages.pastoral.src, label: "Painting" },
]

const inks = [
  { value: "currentColor", label: "Foreground" },
  { value: "#1d3fb0", label: "Riso blue" },
  { value: "#c2410c", label: "Burnt orange" },
  { value: "#b08d4a", label: "Gold" },
] as const

export function HalftoneImageDemo() {
  const [src, setSrc] = React.useState<string>(images[0].value)
  const [dotSize, setDotSize] = React.useState(6)
  const [angle, setAngle] = React.useState(45)
  const [shape, setShape] = React.useState<HalftoneShape>("dot")
  const [color, setColor] = React.useState<string>(inks[0].value)
  const { resolvedTheme } = useTheme()
  const [invert, setInvert] = React.useState(false)
  // Light ink on a dark page reads as a negative unless the highlights are screened instead.
  React.useEffect(() => setInvert(resolvedTheme === "dark"), [resolvedTheme])
  const [contrast, setContrast] = React.useState(1.1)

  return (
    <DemoPanel>
      <DemoStage>
        <HalftoneImage
          src={src}
          alt="Halftone rendering of a classical artwork"
          dotSize={dotSize}
          angle={angle}
          shape={shape}
          color={color}
          invert={invert}
          contrast={contrast}
          background={invert ? "#15130f" : "transparent"}
          className="aspect-[4/5] w-full max-w-xs rounded-xl"
        />
      </DemoStage>
      <DemoControls>
        <Choice label="Image" value={src} options={images} onChange={setSrc} />
        <Choice
          label="Shape"
          value={shape}
          options={[
            { value: "dot", label: "Dot" },
            { value: "line", label: "Line" },
            { value: "square", label: "Square" },
          ]}
          onChange={setShape}
        />
        <Range label="Dot size" value={dotSize} onChange={setDotSize} min={3} max={16} format={(v) => `${v}px`} />
        <Range label="Angle" value={angle} onChange={setAngle} min={0} max={90} format={(v) => `${v}°`} />
        <Range label="Contrast" value={contrast} onChange={setContrast} min={0.5} max={2} step={0.1} format={(v) => v.toFixed(1)} />
        <Swatches label="Ink" value={color} options={inks} onChange={setColor} />
        <Toggle label="Invert (light ink on dark)" checked={invert} onChange={setInvert} />
      </DemoControls>
    </DemoPanel>
  )
}
