"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { demoImages } from "@/lib/demo-images"
import {
  Cyanotype,
  cyanotypePresets,
  type CyanotypePreset,
} from "@/registry/new-york/blocks/cyanotype/cyanotype"
import { Choice, DemoControls, DemoPanel, DemoStage, Range } from "./controls"

const presetOptions = (Object.keys(cyanotypePresets) as CyanotypePreset[]).map((p) => ({
  value: p,
  label: p[0].toUpperCase() + p.slice(1),
}))

const subjectOptions = [
  { value: "print", label: "Print" },
  { value: "photogram", label: "Photogram" },
] as const

/** One fern frond: alternating pinnae of overlapping pinnules, longest low down, tapering to the tip. */
function Frond({ x, y, height, bend, rotate }: { x: number; y: number; height: number; bend: number; rotate: number }) {
  const pinnae = 26
  const leaves: React.ReactNode[] = []
  const at = (t: number) => [bend * t * t * height, -t * height] as const
  for (let i = 4; i < pinnae; i++) {
    const t = i / pinnae
    const side = i % 2 ? 1 : -1
    const [bx, by] = at(t)
    const angle = ((62 - t * 20) * Math.PI) / 180
    const dx = side * Math.sin(angle)
    const dy = -Math.cos(angle)
    // Lanceolate: a bare stipe, the longest pinnae a third of the way up, tapering to the tip.
    const length = height * 0.3 * Math.pow(1 - t, 0.75) * Math.min(1, (t - 0.1) / 0.25)
    const count = Math.max(3, Math.round(length / 4.5))
    for (let j = 0; j < count; j++) {
      const u = (j + 0.5) / count
      const r = Math.max(1.6, length * 0.12 * (1 - u * 0.7))
      const flip = j % 2 ? 1 : -1
      const cx = bx + dx * length * u + -dy * r * 0.55 * flip
      const cy = by + dy * length * u + dx * r * 0.55 * flip
      const deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90 * flip * 0.7
      leaves.push(
        <ellipse key={`${i}-${j}`} cx={cx} cy={cy} rx={r} ry={r * 0.5} transform={`rotate(${deg} ${cx} ${cy})`} />
      )
    }
    leaves.push(
      <line key={`r${i}`} x1={bx} y1={by} x2={bx + dx * length} y2={by + dy * length} strokeWidth={1.2} stroke="currentColor" />
    )
  }
  const [tx, ty] = at(1)
  return (
    <g transform={`translate(${x} ${y}) rotate(${rotate})`}>
      <path d={`M0 0 Q0 ${-height / 2} ${tx} ${ty}`} fill="none" stroke="currentColor" strokeWidth={2.4} />
      {leaves}
    </g>
  )
}

function FernSpecimen() {
  return (
    <svg viewBox="0 0 360 450" preserveAspectRatio="xMidYMid slice" className="size-full text-black">
      <rect width="360" height="450" fill="#fff" />
      <Frond x={140} y={470} height={440} bend={0.12} rotate={-8} />
      <Frond x={270} y={470} height={290} bend={-0.16} rotate={16} />
    </svg>
  )
}

export function CyanotypeDemo() {
  const [subject, setSubject] = React.useState<"print" | "photogram">("print")
  const [preset, setPreset] = React.useState<CyanotypePreset>("classic")
  const [exposure, setExposure] = React.useState(0)
  const [roughness, setRoughness] = React.useState(0.6)
  const [mottle, setMottle] = React.useState(0.4)
  const [run, setRun] = React.useState(0)

  return (
    <DemoPanel>
      <DemoStage>
        <Cyanotype
          key={run}
          mode={subject}
          src={subject === "print" ? demoImages.portrait.src : undefined}
          alt={subject === "print" ? demoImages.portrait.alt : undefined}
          preset={preset}
          exposure={exposure}
          roughness={roughness}
          mottle={mottle}
          border={subject === "print" ? 18 : 0}
          contrast={subject === "print" ? 1.15 : 1.4}
          develop={run > 0}
          className="aspect-[4/5] w-full max-w-sm rounded-sm shadow-sm"
        >
          {subject === "photogram" ? <FernSpecimen /> : undefined}
        </Cyanotype>
      </DemoStage>
      <DemoControls>
        <Choice label="Subject" value={subject} options={subjectOptions} onChange={setSubject} />
        <Choice label="Tone" value={preset} options={presetOptions} onChange={setPreset} />
        <Range label="Exposure" value={exposure} onChange={setExposure} min={-1} max={1} step={0.05} format={(v) => v.toFixed(2)} />
        <Range label="Brush edge" value={roughness} onChange={setRoughness} min={0} max={1} step={0.05} format={(v) => v.toFixed(2)} />
        <Range label="Mottle" value={mottle} onChange={setMottle} min={0} max={1} step={0.05} format={(v) => v.toFixed(2)} />
        <Button variant="outline" size="sm" className="mt-auto" onClick={() => setRun((n) => n + 1)}>
          <HugeiconsIcon icon={RefreshIcon} />
          Develop
        </Button>
      </DemoControls>
    </DemoPanel>
  )
}
