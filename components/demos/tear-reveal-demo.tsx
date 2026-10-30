"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { demoImages } from "@/lib/demo-images"
import { TearReveal, type TearDirection } from "@/registry/new-york/blocks/tear-reveal/tear-reveal"
import { Choice, DemoControls, DemoPanel, DemoStage, Swatches } from "./controls"

const directionOptions = [
  { value: "down", label: "Down" },
  { value: "across", label: "Across" },
  { value: "corner", label: "Corner" },
] as const

const paperOptions = [
  { value: "#f4f1ea", label: "Paper" },
  { value: "#e9dcc0", label: "Manila" },
  { value: "#387478", label: "Teal" },
  { value: "#6e2a24", label: "Oxblood" },
  { value: "#241d17", label: "Ink" },
] as const

/** A printed admission ticket. Everything uses currentColor, so it reads on any paper. */
function Ticket() {
  return (
    <div className="absolute inset-3 flex flex-col items-center justify-between border border-current/30 px-5 py-8 text-center">
      <div className="absolute inset-1 border border-current/15" />
      <p className="text-[10px] font-medium tracking-[0.3em] uppercase opacity-70">Private view</p>
      <div className="flex flex-col items-center gap-3">
        <span className="grid size-14 place-items-center rounded-full border border-[#b8893a] text-[#b8893a]">
          <span className="font-serif text-2xl leading-none">vii</span>
        </span>
        <p className="font-serif text-3xl leading-tight">
          The Water
          <br />
          Carrier
        </p>
        <p className="text-xs opacity-70">Admit one, gallery four</p>
      </div>
      <p className="text-[10px] tracking-[0.2em] uppercase opacity-60">Tear from the notch</p>
    </div>
  )
}

export function TearRevealDemo() {
  const [direction, setDirection] = React.useState<TearDirection>("down")
  const [paper, setPaper] = React.useState<string>(paperOptions[0].value)
  const [torn, setTorn] = React.useState(false)
  const [seed, setSeed] = React.useState(5)

  return (
    <DemoPanel>
      <DemoStage className="py-6">
        <TearReveal
          direction={direction}
          paper={paper}
          seed={seed}
          torn={torn}
          onTear={() => setTorn(true)}
          cover={<Ticket />}
          className="aspect-[3/4] w-full max-w-[300px] rounded-md shadow-[0_18px_40px_-18px_rgb(0_0_0/0.45)]"
        >
          <figure className="relative size-full overflow-hidden rounded-md bg-muted">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={demoImages.waterJar.src}
              alt={demoImages.waterJar.alt}
              draggable={false}
              className="size-full object-cover"
            />
            <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-4 pt-10 pb-4 text-white">
              <p className="font-serif text-xl leading-tight">The Water Carrier</p>
              <p className="text-xs text-white/75">Oil on canvas, gallery four</p>
            </figcaption>
          </figure>
        </TearReveal>
      </DemoStage>
      <DemoControls>
        <Choice label="Direction" value={direction} options={directionOptions} onChange={setDirection} />
        <Swatches label="Paper" value={paper} options={paperOptions} onChange={setPaper} />
        <Button
          variant="outline"
          size="sm"
          className="mt-auto"
          onClick={() => {
            setTorn(false)
            setSeed((s) => s + 1)
          }}
        >
          <HugeiconsIcon icon={RefreshIcon} />
          Reset
        </Button>
      </DemoControls>
    </DemoPanel>
  )
}
