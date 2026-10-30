"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  GrainOverlay,
  grainPresets,
  type GrainVariant,
} from "@/registry/new-york/blocks/grain-overlay/grain-overlay"
import { Choice, DemoControls, DemoPanel, DemoStage, Range, Toggle } from "./controls"

type Surface = "paper" | "ink"

export function GrainOverlayDemo() {
  const [variant, setVariant] = React.useState<GrainVariant>("grain")
  const [surface, setSurface] = React.useState<Surface>("paper")
  const [opacity, setOpacity] = React.useState<number | undefined>(undefined)
  const [animate, setAnimate] = React.useState(false)
  const [tinted, setTinted] = React.useState(false)

  return (
    <DemoPanel>
      <DemoStage>
        <section
          className={cn(
            "relative w-full max-w-md overflow-hidden rounded-2xl border p-8 shadow-sm",
            surface === "paper" ? "bg-[#f6f1e7] text-[#1d1a16]" : "bg-[#1a1714] text-[#f1ebe0]"
          )}
        >
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-60">Section · 04</p>
          <h3 className="mt-3 font-serif text-3xl leading-tight">
            Printed on paper, <span className="opacity-70">not pixels.</span>
          </h3>
          <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-70">
            The overlay sits above this content, ignores the pointer and reads on light and dark alike.
          </p>
          <div className="mt-6 flex gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-xs",
                surface === "paper" ? "bg-[#1d1a16] text-[#f6f1e7]" : "bg-[#f1ebe0] text-[#1a1714]"
              )}
            >
              Get started
            </span>
            <span className="rounded-full border border-current/30 px-3 py-1 text-xs">Read the notes</span>
          </div>
          <GrainOverlay
            variant={variant}
            opacity={opacity}
            animate={animate}
            color={tinted ? "#b08d4a" : undefined}
          />
        </section>
      </DemoStage>
      <DemoControls>
        <Choice
          label="Variant"
          value={variant}
          options={[
            { value: "grain", label: "Grain" },
            { value: "paper", label: "Paper" },
            { value: "fiber", label: "Fiber" },
          ]}
          onChange={(v) => {
            setVariant(v)
            setOpacity(undefined)
          }}
        />
        <Choice
          label="Surface"
          value={surface}
          options={[
            { value: "paper", label: "Light" },
            { value: "ink", label: "Dark" },
          ]}
          onChange={setSurface}
        />
        <Range
          label="Opacity"
          value={opacity ?? grainPresets[variant].opacity}
          onChange={setOpacity}
          min={0}
          max={1}
          step={0.01}
          format={(v) => v.toFixed(2)}
        />
        <Toggle label="Tint with a colour" checked={tinted} onChange={setTinted} />
        <Toggle label="Animate (film flicker)" checked={animate} onChange={setAnimate} />
      </DemoControls>
    </DemoPanel>
  )
}
