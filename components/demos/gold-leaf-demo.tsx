"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { GoldLeaf, goldLeafTones, type GoldLeafTone } from "@/registry/new-york/blocks/gold-leaf/gold-leaf"
import { Choice, DemoControls, DemoPanel, DemoStage, Range, Text } from "./controls"

const toneLabels: Record<GoldLeafTone, string> = {
  yellow: "23k",
  rose: "Rose",
  white: "Palladium",
  copper: "Copper",
}

const toneOptions = (Object.keys(goldLeafTones) as GoldLeafTone[]).map((t) => ({ value: t, label: toneLabels[t] }))

/** Steps the type down as the text grows, so a long word still sits on one or two lines. */
function fit(text: string, sizes: [string, string, string]) {
  const n = Math.max(0, ...text.split(/\s+/).map((w) => w.length), text.length / 2)
  return n <= 6 ? sizes[0] : n <= 10 ? sizes[1] : sizes[2]
}

export function GoldLeafDemo() {
  const [text, setText] = React.useState("")
  const [tone, setTone] = React.useState<GoldLeafTone>("yellow")
  const [leafSize, setLeafSize] = React.useState(32)
  const [cracks, setCracks] = React.useState(0.3)
  const [sheen, setSheen] = React.useState(0.85)
  const [run, setRun] = React.useState(0)

  const shared = { tone, leafSize, cracks, sheen, lay: run > 0 }
  const custom = text.trim()

  return (
    <DemoPanel>
      <DemoStage className="flex-col gap-3">
        <div className="flex w-full flex-col items-center justify-center rounded-sm bg-[#1d1813] px-6 py-12 text-center shadow-sm sm:py-16">
          <p className="mb-3 font-mono text-[10px] tracking-[0.3em] text-[#b08d4a]/70 uppercase">Water gilding on glass</p>
          <GoldLeaf
            key={`a${run}`}
            as="h3"
            {...shared}
            className={cn(
              "max-w-full font-serif leading-[0.95] tracking-[-0.02em] text-balance wrap-anywhere",
              fit(custom || "Aurum", ["text-7xl sm:text-8xl", "text-5xl sm:text-6xl", "text-4xl sm:text-5xl"])
            )}
          >
            {custom || "Aurum"}
          </GoldLeaf>
        </div>
        <div className="flex w-full flex-col items-center justify-center rounded-sm bg-[#F4F1EA] px-6 py-10 text-center shadow-sm ring-1 ring-black/5">
          <GoldLeaf
            key={`b${run}`}
            as="h3"
            {...shared}
            seed={12}
            className={cn(
              "max-w-full font-serif leading-none tracking-[-0.01em] text-balance italic wrap-anywhere",
              fit(custom || "Ex Libris", ["text-5xl sm:text-6xl", "text-4xl sm:text-5xl", "text-3xl sm:text-4xl"])
            )}
          >
            {custom || "Ex Libris"}
          </GoldLeaf>
          <p className="mt-3 font-serif text-sm text-[#241d17]/60 italic">tooled on the spine, laid by hand</p>
        </div>
      </DemoStage>
      <DemoControls>
        <Text label="Your text" value={text} onChange={setText} placeholder="Aurum" maxLength={28} />
        <Choice label="Tone" value={tone} options={toneOptions} onChange={setTone} />
        <Range label="Leaf size" value={leafSize} onChange={setLeafSize} min={14} max={64} step={1} format={(v) => `${v}px`} />
        <Range label="Cracks" value={cracks} onChange={setCracks} min={0} max={1} step={0.05} format={(v) => v.toFixed(2)} />
        <Range label="Sheen" value={sheen} onChange={setSheen} min={0} max={1} step={0.05} format={(v) => v.toFixed(2)} />
        <Button variant="outline" size="sm" className="mt-auto" onClick={() => setRun((n) => n + 1)}>
          <HugeiconsIcon icon={RefreshIcon} />
          Lay leaf
        </Button>
      </DemoControls>
    </DemoPanel>
  )
}
