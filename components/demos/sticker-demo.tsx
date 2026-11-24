"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sticker } from "@/registry/new-york/blocks/sticker/sticker"
import { DemoControls, DemoPanel, DemoStage, Range, Swatches, Toggle } from "./controls"

const backs = [
  { value: "#eceae4", label: "Paper" },
  { value: "#d9c4a0", label: "Kraft" },
  { value: "#c9cdd3", label: "Silver" },
] as const

/** A scalloped seal: `n` bumps around a circle. */
function scallop(n: number, r: number, depth: number) {
  const pts: string[] = []
  for (let i = 0; i <= n * 8; i++) {
    const a = (i / (n * 8)) * Math.PI * 2
    const rr = r + depth * Math.cos(a * n)
    pts.push(`${(50 + Math.cos(a) * rr).toFixed(2)},${(50 + Math.sin(a) * rr).toFixed(2)}`)
  }
  return `M${pts.join("L")}Z`
}

function Seal() {
  return (
    <svg viewBox="0 0 100 100" className="h-auto w-full">
      <path d={scallop(14, 45, 3.5)} fill="#d9714e" />
      <circle cx="50" cy="50" r="34" fill="none" stroke="#f6e7d8" strokeWidth="1.2" strokeDasharray="2 2.4" />
      <text x="50" y="47" textAnchor="middle" fill="#f6e7d8" fontFamily="Georgia, serif" fontSize="15" fontStyle="italic">
        hand
      </text>
      <text x="50" y="63" textAnchor="middle" fill="#f6e7d8" fontFamily="Georgia, serif" fontSize="15" fontStyle="italic">
        made
      </text>
    </svg>
  )
}

function HoloStar() {
  const id = React.useId()
  return (
    <svg viewBox="0 0 100 100" className="h-auto w-full">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#a7f3e6" />
          <stop offset="0.3" stopColor="#f5f0a0" />
          <stop offset="0.55" stopColor="#f6b8e4" />
          <stop offset="0.8" stopColor="#b9c4fb" />
          <stop offset="1" stopColor="#a7f3e6" />
        </linearGradient>
      </defs>
      <path
        d="M50 2 L60 36 L94 24 L68 50 L94 76 L60 64 L50 98 L40 64 L6 76 L32 50 L6 24 L40 36 Z"
        fill={`url(#${id})`}
        strokeLinejoin="round"
      />
      <circle cx="50" cy="50" r="3" fill="none" stroke="#8f7fae" strokeOpacity="0.5" />
    </svg>
  )
}

function Floppy() {
  return (
    <svg viewBox="0 0 90 100" className="h-auto w-full">
      <path d="M6 4 H74 L86 16 V94 a4 4 0 0 1 -4 4 H8 a4 4 0 0 1 -4 -4 V8 a4 4 0 0 1 2 -4Z" fill="#ef8a5c" />
      <rect x="20" y="4" width="46" height="32" rx="2" fill="#f7e5cf" />
      <rect x="50" y="9" width="10" height="22" rx="1" fill="#5a463c" />
      <rect x="14" y="50" width="62" height="42" rx="3" fill="#f7e5cf" />
      <text x="45" y="78" textAnchor="middle" fill="#5a463c" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="16">
        SAVE
      </text>
    </svg>
  )
}

function Cursor() {
  return (
    <svg viewBox="0 0 80 90" className="h-auto w-full">
      <path d="M6 4 L74 38 L44 46 L60 76 L46 84 L30 54 L8 74 Z" fill="#4766e8" strokeLinejoin="round" />
      <path d="M12 12 L60 36" stroke="#fff" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function Tag() {
  return (
    <div className="grid place-items-center rounded-full bg-[#387478] px-[1.4em] py-[0.55em] font-serif text-[clamp(13px,2.4vw,22px)] whitespace-nowrap text-[#f4f1ea] italic">
      peel me
    </div>
  )
}

function Smiley() {
  return (
    <svg viewBox="0 0 100 100" className="h-auto w-full">
      <circle cx="50" cy="50" r="46" fill="#f4c542" />
      <ellipse cx="36" cy="40" rx="5" ry="8" fill="#3b2f1e" />
      <ellipse cx="64" cy="40" rx="5" ry="8" fill="#3b2f1e" />
      <path d="M28 60 Q50 82 72 60" fill="none" stroke="#3b2f1e" strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

function Heart() {
  return (
    <svg viewBox="0 0 100 90" className="h-auto w-full">
      <path d="M50 86 L10 46 A22 22 0 0 1 50 16 A22 22 0 0 1 90 46 Z" fill="#ec8fb2" strokeLinejoin="round" />
      <path d="M22 34 a12 12 0 0 1 12 -10" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="4" strokeLinecap="round" />
    </svg>
  )
}

const stickers = [
  { key: "seal", label: "Hand made seal", art: <Seal />, className: "left-[7%] top-[9%] w-[19%]", rotate: -8 },
  { key: "star", label: "Holographic star", art: <HoloStar />, className: "left-[40%] top-[5%] w-[16%]", rotate: 12 },
  { key: "floppy", label: "Floppy disk", art: <Floppy />, className: "left-[73%] top-[10%] w-[15%]", rotate: 8 },
  { key: "cursor", label: "Cursor", art: <Cursor />, className: "left-[10%] top-[60%] w-[13%]", rotate: -12 },
  { key: "tag", label: "Peel me tag", art: <Tag />, className: "left-[34%] top-[46%]", rotate: -5 },
  { key: "smiley", label: "Smiley", art: <Smiley />, className: "left-[72%] top-[56%] w-[15%]", rotate: 10 },
  { key: "heart", label: "Heart", art: <Heart />, className: "left-[50%] top-[73%] w-[11%]", rotate: -10 },
]

export function StickerDemo() {
  const [border, setBorder] = React.useState(6)
  const [back, setBack] = React.useState<string>(backs[0].value)
  const [threshold, setThreshold] = React.useState(0.4)
  const [hoverPeel, setHoverPeel] = React.useState(true)
  const [movable, setMovable] = React.useState(true)
  const [round, setRound] = React.useState(0)
  const [moved, setMoved] = React.useState(0)

  return (
    <DemoPanel>
      <DemoStage>
        <div
          key={round}
          className={cn(
            "relative isolate aspect-[4/3] w-full max-w-[520px] overflow-hidden rounded-xl sm:aspect-[16/12]",
            "bg-[#f2efe8] bg-[radial-gradient(circle_at_30%_20%,rgb(255_255_255/0.7),transparent_60%)] ring-1 ring-black/5"
          )}
        >
          {stickers.map((s) => (
            <Sticker
              key={s.key}
              label={s.label}
              rotate={s.rotate}
              border={border}
              backColor={back}
              threshold={threshold}
              hoverPeel={hoverPeel}
              movable={movable}
              onStick={() => setMoved((m) => m + 1)}
              className={cn("absolute", s.className)}
            >
              {s.art}
            </Sticker>
          ))}
        </div>
      </DemoStage>
      <DemoControls>
        <Range label="Border" value={border} onChange={setBorder} min={0} max={10} format={(v) => `${v} px`} />
        <Swatches label="Back" value={back} options={backs} onChange={setBack} />
        <Range
          label="Comes off at"
          value={threshold}
          onChange={setThreshold}
          min={0.2}
          max={0.7}
          step={0.05}
          format={(v) => `${Math.round(v * 100)}%`}
        />
        <Toggle label="Corner lifts on hover" checked={hoverPeel} onChange={setHoverPeel} />
        <Toggle label="Can be moved" checked={movable} onChange={setMovable} />
        <p className="flex justify-between text-xs text-muted-foreground">
          Restuck
          <span className="font-mono text-foreground tabular-nums">{moved}</span>
        </p>
        <Button
          variant="outline"
          size="sm"
          className="mt-auto"
          disabled={moved === 0}
          onClick={() => {
            setRound((r) => r + 1)
            setMoved(0)
          }}
        >
          <HugeiconsIcon icon={RefreshIcon} />
          Reset
        </Button>
      </DemoControls>
    </DemoPanel>
  )
}
