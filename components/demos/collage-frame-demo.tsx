"use client"

import * as React from "react"

import {
  CollageFrame,
  CollageFrameOverlay,
  type CollageShape,
} from "@/registry/new-york/blocks/collage-frame/collage-frame"
import { demoImages } from "@/lib/demo-images"
import { Choice, DemoControls, DemoPanel, DemoStage, Range, Toggle } from "./controls"

export function CollageFrameDemo() {
  const [shape, setShape] = React.useState<CollageShape>("arch")
  const [tilt, setTilt] = React.useState(-2)
  const [roughness, setRoughness] = React.useState(0.5)
  const [gilt, setGilt] = React.useState(false)

  return (
    <DemoPanel>
      <DemoStage className="py-6">
        <CollageFrame
          src={demoImages.portrait.src}
          alt={demoImages.portrait.alt}
          shape={shape}
          tilt={tilt}
          roughness={roughness}
          frameColor={gilt ? "#b08d4a" : undefined}
          className="aspect-[4/5] w-full max-w-[260px]"
        >
          <CollageFrameOverlay position="bottom-right" hang={28} tilt={-tilt}>
            <div className="w-44 rounded-xl border bg-card/95 p-3 text-card-foreground shadow-xl backdrop-blur">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Lot 17</span>
                <span className="size-1.5 rounded-full bg-emerald-500" />
              </div>
              <p className="mt-1.5 font-serif text-lg leading-none">Pre-Raphaelite school</p>
              <p className="mt-2 text-xs text-muted-foreground">Oil painting · 19th century</p>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xs text-muted-foreground">Est.</span>
                <span className="font-mono text-sm tabular-nums">€ 42.0M</span>
              </div>
            </div>
          </CollageFrameOverlay>
        </CollageFrame>
      </DemoStage>
      <DemoControls>
        <Choice
          label="Shape"
          value={shape}
          options={[
            { value: "arch", label: "Arch" },
            { value: "oval", label: "Oval" },
            { value: "torn", label: "Torn" },
            { value: "museum", label: "Museum" },
            { value: "plain", label: "Plain" },
          ]}
          onChange={setShape}
        />
        <Range label="Tilt" value={tilt} onChange={setTilt} min={-8} max={8} step={0.5} format={(v) => `${v}°`} />
        {shape === "torn" && (
          <Range label="Roughness" value={roughness} onChange={setRoughness} min={0} max={1} step={0.05} format={(v) => v.toFixed(2)} />
        )}
        {shape === "museum" && <Toggle label="Gilt frame" checked={gilt} onChange={setGilt} />}
      </DemoControls>
    </DemoPanel>
  )
}
