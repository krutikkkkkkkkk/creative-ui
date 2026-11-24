"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScratchCard, type ScratchCardFoil } from "@/registry/new-york/blocks/scratch-card/scratch-card"
import { Choice, DemoControls, DemoPanel, DemoStage, Range, Swatches } from "./controls"

const cards = {
  "#f2a9c8": { ink: "#5b1e2c", line: "rgb(255 255 255 / 0.85)", well: "rgb(255 255 255 / 0.5)" },
  "#f4f1ea": { ink: "#6e2a24", line: "rgb(110 42 36 / 0.4)", well: "rgb(110 42 36 / 0.07)" },
  "#387478": { ink: "#f4f1ea", line: "rgb(244 241 234 / 0.55)", well: "rgb(0 0 0 / 0.16)" },
} as const

type CardColor = keyof typeof cards

const cardOptions = [
  { value: "#f2a9c8", label: "Rose" },
  { value: "#f4f1ea", label: "Paper" },
  { value: "#387478", label: "Teal" },
] as const

const foilOptions = [
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
  { value: "copper", label: "Copper" },
] as const

const prizes = [
  "Breakfast in bed",
  "A slow dance in the kitchen",
  "One film, your pick",
  "A handwritten letter",
  "A Sunday with no plans",
]

/** A ticket rule with the corners scooped out, drawn with fixed-size arcs so it never stretches. */
function TicketRule() {
  const corner = "absolute size-[3.4cqw] text-[var(--line)]"
  const arc = (
    <svg viewBox="0 0 10 10" className="size-full overflow-visible" fill="none" stroke="currentColor">
      <path d="M10 0.5 A 9.5 9.5 0 0 1 0.5 10" vectorEffect="non-scaling-stroke" />
    </svg>
  )
  return (
    <div aria-hidden className="pointer-events-none absolute inset-[3.5cqw]">
      <div className="absolute inset-x-[3.4cqw] top-0 h-px bg-[var(--line)]" />
      <div className="absolute inset-x-[3.4cqw] bottom-0 h-px bg-[var(--line)]" />
      <div className="absolute inset-y-[3.4cqw] left-0 w-px bg-[var(--line)]" />
      <div className="absolute inset-y-[3.4cqw] right-0 w-px bg-[var(--line)]" />
      <div className={cn(corner, "top-0 left-0")}>{arc}</div>
      <div className={cn(corner, "top-0 right-0 rotate-90")}>{arc}</div>
      <div className={cn(corner, "right-0 bottom-0 rotate-180")}>{arc}</div>
      <div className={cn(corner, "bottom-0 left-0 -rotate-90")}>{arc}</div>
    </div>
  )
}

function Kisses({ side }: { side: "left" | "right" }) {
  return (
    <p
      aria-hidden
      className={cn(
        "absolute top-1/2 -translate-y-1/2 text-[2.6cqw] font-semibold tracking-[0.35em] [writing-mode:vertical-rl]",
        side === "left" ? "left-[7cqw] rotate-180" : "right-[7cqw]"
      )}
    >
      xoxoxoxoxo
    </p>
  )
}

function Heart({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 22" className={className} fill="currentColor" aria-hidden>
      <path d="M12 21.5 1.9 11.6A6 6 0 0 1 12 3.4a6 6 0 0 1 10.1 8.2Z" />
    </svg>
  )
}

export function ScratchCardDemo() {
  const [card, setCard] = React.useState<CardColor>("#f2a9c8")
  const [foil, setFoil] = React.useState<ScratchCardFoil>("silver")
  const [brush, setBrush] = React.useState(28)
  const [threshold, setThreshold] = React.useState(0.6)
  const [revealed, setRevealed] = React.useState(false)
  const [progress, setProgress] = React.useState(0)
  const [prize, setPrize] = React.useState(0)
  const [round, setRound] = React.useState(0)
  const { ink, line, well } = cards[card]

  return (
    <DemoPanel>
      <DemoStage className="py-6">
        <div
          className="@container relative aspect-[10/7] w-full max-w-[440px] rounded-[6px] font-serif shadow-[0_18px_40px_-18px_rgb(0_0_0/0.45)] ring-1 ring-black/5"
          style={{ background: card, color: ink, ["--line" as string]: line }}
        >
          <TicketRule />
          <Kisses side="left" />
          <Kisses side="right" />

          <div className="absolute inset-0 flex flex-col items-center justify-center px-[14cqw] text-center">
            <p className="text-[8.4cqw] leading-none font-bold tracking-[0.04em] uppercase">Love Coupon</p>
            <p className="mt-[1.4cqw] text-[3.4cqw] italic opacity-85">this entitles you to</p>

            <ScratchCard
              foil={foil}
              brushSize={brush}
              threshold={threshold}
              key={round}
              seed={round + 3}
              revealed={revealed}
              onRevealedChange={setRevealed}
              onProgress={setProgress}
              label="Scratch to reveal your coupon"
              className="mt-[2.6cqw] h-[15cqw] w-full rounded-[2px]"
            >
              <div
                className="flex size-full items-center justify-center rounded-[2px] px-3"
                style={{ background: well }}
              >
                <p className="text-[4.6cqw] leading-tight italic">{prizes[prize]}</p>
              </div>
            </ScratchCard>

            <div className="mt-[2.4cqw] flex w-full items-center gap-[2cqw] text-[2.4cqw] font-sans font-semibold tracking-[0.18em] uppercase">
              <span className="h-px flex-1 border-t border-dotted border-[var(--line)]" />
              Scratch here
              <span className="h-px flex-1 border-t border-dotted border-[var(--line)]" />
            </div>
            <Heart className="mt-[1.6cqw] size-[4.4cqw]" />
          </div>
        </div>
      </DemoStage>
      <DemoControls>
        <Swatches
          label="Coupon"
          value={card}
          options={cardOptions}
          onChange={(v) => setCard(v as CardColor)}
        />
        <Choice label="Foil" value={foil} options={foilOptions} onChange={setFoil} />
        <Range label="Brush" value={brush} onChange={setBrush} min={14} max={48} step={2} format={(v) => `${v} px`} />
        <Range
          label="Clears at"
          value={threshold}
          onChange={setThreshold}
          min={0.3}
          max={0.9}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
        />
        <p className="flex justify-between text-xs text-muted-foreground">
          Scratched
          <span className="font-mono text-foreground tabular-nums">
            {revealed ? "100%" : `${Math.round(progress * 100)}%`}
          </span>
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-auto"
          disabled={!revealed && progress === 0}
          onClick={() => {
            setRevealed(false)
            setProgress(0)
            setPrize((p) => (p + 1) % prizes.length)
            setRound((r) => r + 1)
          }}
        >
          <HugeiconsIcon icon={RefreshIcon} />
          Reset
        </Button>
      </DemoControls>
    </DemoPanel>
  )
}
