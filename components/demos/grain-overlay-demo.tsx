"use client"

import * as React from "react"

import { GrainOverlay, type GrainVariant } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"
import { Choice, DemoControls, DemoPanel, DemoStage, Range, Toggle } from "./controls"

export function GrainOverlayDemo() {
  const [variant, setVariant] = React.useState<GrainVariant>("grain")
  const [opacity, setOpacity] = React.useState<number | undefined>(undefined)
  const [animate, setAnimate] = React.useState(false)
  const [tinted, setTinted] = React.useState(false)

  return (
    <DemoPanel>
      <DemoStage>
        <section className="relative w-full max-w-md overflow-hidden rounded-2xl border bg-[#f6f1e7] p-8 text-[#1d1a16] shadow-sm dark:bg-[#1a1714] dark:text-[#f1ebe0]">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase opacity-60">Section · 04</p>
          <h3 className="mt-3 font-serif text-3xl leading-tight">
            Printed on paper, <span className="italic opacity-70">not pixels.</span>
          </h3>
          <p className="mt-3 max-w-xs text-sm leading-relaxed opacity-70">
            The overlay sits above this content, ignores the pointer and blends with whatever is underneath.
          </p>
          <div className="mt-6 flex gap-2">
            <span className="rounded-full bg-[#1d1a16] px-3 py-1 text-xs text-[#f6f1e7] dark:bg-[#f1ebe0] dark:text-[#1a1714]">
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
        <Range
          label="Opacity"
          value={opacity ?? (variant === "grain" ? 0.22 : variant === "paper" ? 0.45 : 0.35)}
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
