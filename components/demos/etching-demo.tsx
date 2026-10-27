"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Etching } from "@/registry/new-york/blocks/etching/etching"
import { Choice, DemoControls, DemoPanel, DemoStage, Range, Swatches } from "./controls"

const inks = [
  { value: "#241d17", label: "Lamp black" },
  { value: "#6e2a24", label: "Oxblood" },
  { value: "#2f5f63", label: "Prussian teal" },
  { value: "#5b3a1e", label: "Sepia" },
] as const

const layerOptions = [
  { value: "1", label: "Hatch" },
  { value: "2", label: "Cross" },
  { value: "3", label: "Deep" },
] as const

export function EtchingDemo() {
  const [lineSpacing, setLineSpacing] = React.useState(4)
  const [angle, setAngle] = React.useState(35)
  const [layers, setLayers] = React.useState<"1" | "2" | "3">("3")
  const [ink, setInk] = React.useState<string>(inks[0].value)
  const [run, setRun] = React.useState(0)

  return (
    <DemoPanel>
      <DemoStage>
        <Etching
          key={run}
          src="/demo/marble-bust.webp"
          alt="Marble bust of a woman in profile"
          lineSpacing={lineSpacing}
          angle={angle}
          layers={Number(layers) as 1 | 2 | 3}
          ink={ink}
          className="aspect-[4/5] w-full max-w-sm rounded-sm shadow-sm ring-1 ring-black/5"
        />
      </DemoStage>
      <DemoControls>
        <Range label="Line spacing" value={lineSpacing} onChange={setLineSpacing} min={3} max={10} step={0.5} format={(v) => `${v}px`} />
        <Range label="Angle" value={angle} onChange={setAngle} min={-90} max={90} step={1} format={(v) => `${v}°`} />
        <Choice label="Layers" value={layers} options={layerOptions} onChange={setLayers} />
        <Swatches label="Ink" value={ink} options={inks} onChange={setInk} />
        <Button variant="outline" size="sm" className="mt-auto" onClick={() => setRun((n) => n + 1)}>
          <HugeiconsIcon icon={RefreshIcon} />
          Re-engrave
        </Button>
      </DemoControls>
    </DemoPanel>
  )
}
