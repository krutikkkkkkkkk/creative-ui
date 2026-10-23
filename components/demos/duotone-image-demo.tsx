"use client"

import * as React from "react"

import {
  DuotoneImage,
  duotonePresets,
  type DuotonePreset,
} from "@/registry/new-york/blocks/duotone-image/duotone-image"
import { Choice, DemoControls, DemoPanel, DemoStage, Range } from "./controls"

const presetOptions = (Object.keys(duotonePresets) as DuotonePreset[]).map((p) => ({
  value: p,
  label: p[0].toUpperCase() + p.slice(1),
}))

export function DuotoneImageDemo() {
  const [preset, setPreset] = React.useState<DuotonePreset>("riso")
  const [mix, setMix] = React.useState(1)
  const [offset, setOffset] = React.useState(3)
  const [contrast, setContrast] = React.useState(1.1)

  return (
    <DemoPanel>
      <DemoStage>
        <DuotoneImage
          src="/demo/venus.jpg"
          alt="The Birth of Venus, Sandro Botticelli"
          preset={preset}
          mix={mix}
          offset={offset}
          contrast={contrast}
          className="aspect-[3/2] w-full max-w-md rounded-xl"
        />
      </DemoStage>
      <DemoControls>
        <Choice label="Inks" value={preset} options={presetOptions} onChange={setPreset} />
        <div className="flex gap-1.5">
          <span className="size-5 rounded-full border" style={{ background: duotonePresets[preset].shadow }} />
          <span className="size-5 rounded-full border" style={{ background: duotonePresets[preset].highlight }} />
          <span className="ml-1 self-center font-mono text-[10px] text-muted-foreground">
            {duotonePresets[preset].shadow} → {duotonePresets[preset].highlight}
          </span>
        </div>
        <Range label="Mix" value={mix} onChange={setMix} min={0} max={1} step={0.05} format={(v) => v.toFixed(2)} />
        <Range label="Contrast" value={contrast} onChange={setContrast} min={0.5} max={2} step={0.1} format={(v) => v.toFixed(1)} />
        <Range label="Misregistration" value={offset} onChange={setOffset} min={0} max={10} format={(v) => `${v}px`} />
      </DemoControls>
    </DemoPanel>
  )
}
