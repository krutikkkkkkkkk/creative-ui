"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import {
  MarbledPaper,
  marbledPaperPalettes,
  marbledPaperPatterns,
  type MarbledPalette,
  type MarbledPattern,
} from "@/registry/new-york/blocks/marbled-paper/marbled-paper"
import { Choice, DemoControls, DemoPanel, DemoStage, Range, Swatches, Toggle } from "./controls"

const patternLabels: Record<MarbledPattern, string> = {
  stone: "Stone",
  combed: "Combed",
  nonpareil: "Nonpareil",
  bouquet: "Bouquet",
}

const patternOptions = marbledPaperPatterns.map((p) => ({ value: p, label: patternLabels[p] }))

/** Each swatch shows its palette as hard stripes, bath first. */
const stripes = (colors: string[]) =>
  `linear-gradient(135deg, ${colors.map((c, i) => `${c} ${(i / colors.length) * 100}% ${((i + 1) / colors.length) * 100}%`).join(", ")})`

const paletteKeys: MarbledPalette[] = ["endpaper", "nocturne", "tide"]
const paletteOptions = paletteKeys.map((key) => ({
  value: stripes(marbledPaperPalettes[key]),
  label: key[0].toUpperCase() + key.slice(1),
}))

export function MarbledPaperDemo() {
  const [pattern, setPattern] = React.useState<MarbledPattern>("stone")
  const [swatch, setSwatch] = React.useState(paletteOptions[0].value)
  const [speed, setSpeed] = React.useState(1)
  const [interactive, setInteractive] = React.useState(true)
  const [seed, setSeed] = React.useState(7)

  const palette = paletteKeys[paletteOptions.findIndex((o) => o.value === swatch)] ?? "endpaper"
  const dark = palette === "nocturne"

  return (
    <DemoPanel>
      <DemoStage>
        <MarbledPaper
          pattern={pattern}
          colors={marbledPaperPalettes[palette]}
          speed={speed}
          interactive={interactive}
          seed={seed}
          className="aspect-[4/3] w-full max-w-md rounded-sm shadow-sm ring-1 ring-black/10"
          contentClassName="pointer-events-none flex items-center justify-center p-6"
        >
          <div
            className={
              dark
                ? "border border-[#b08d4a]/60 bg-[#1c1713] px-6 py-4 text-center text-[#e8dfcc] shadow-md"
                : "border border-[#241d17]/25 bg-[#f4f1ea] px-6 py-4 text-center text-[#241d17] shadow-md"
            }
          >
            <p className="font-serif text-2xl leading-none">Endpapers</p>
            <p className="mt-2 text-[10px] tracking-[0.2em] uppercase opacity-70">
              {patternLabels[pattern]} &middot; No. {String(seed).padStart(2, "0")}
            </p>
          </div>
        </MarbledPaper>
      </DemoStage>
      <DemoControls>
        <Choice label="Pattern" value={pattern} options={patternOptions} onChange={setPattern} />
        <Swatches label="Palette" value={swatch} options={paletteOptions} onChange={setSwatch} />
        <Range label="Drift" value={speed} onChange={setSpeed} min={0} max={3} step={0.1} format={(v) => v.toFixed(1)} />
        <Toggle label="Comb on drag" checked={interactive} onChange={setInteractive} />
        <Button variant="outline" size="sm" className="mt-auto" onClick={() => setSeed((s) => (s % 99) + 1)}>
          <HugeiconsIcon icon={RefreshIcon} />
          Re-marble
        </Button>
      </DemoControls>
    </DemoPanel>
  )
}
