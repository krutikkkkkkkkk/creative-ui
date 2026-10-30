"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { RefreshIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { WaxSeal, waxSealColors } from "@/registry/new-york/blocks/wax-seal/wax-seal"
import { Choice, DemoControls, DemoPanel, DemoStage, Range, Swatches, Toggle } from "./controls"

const colorOptions = [
  { value: waxSealColors.oxblood, label: "Oxblood" },
  { value: waxSealColors.black, label: "Black" },
  { value: waxSealColors.gold, label: "Gold" },
  { value: waxSealColors.teal, label: "Teal" },
]

const variantOptions = [
  { value: "seal", label: "Seal" },
  { value: "open", label: "Open" },
] as const

const impressionOptions = [
  { value: "letter", label: "Letter" },
  { value: "rosette", label: "Rosette" },
] as const

/** Drawer-style curve: a quick start that glides to rest. */
const GLIDE = "cubic-bezier(0.32, 0.72, 0, 1)"

/** Six petals and a centre, the kind of motif cut into a brass desk seal. */
function Rosette() {
  return (
    <svg viewBox="-12 -12 24 24" className="size-[1.15em]" fill="currentColor">
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse key={deg} cx="0" cy="-6" rx="2.6" ry="5.2" transform={`rotate(${deg})`} />
      ))}
      <circle r="2.4" />
    </svg>
  )
}

/**
 * The back of an envelope in 3D. The flap is hinged on the far panel, so once it swings past upright it
 * passes behind the letter, which then slides up out of the pocket.
 */
function Envelope({ opened, children }: { opened: boolean; children: React.ReactNode }) {
  return (
    <div className="relative aspect-[7/5] w-full text-[#241d17] [transform-style:preserve-3d]">
      {/* Inside of the envelope, seen once the flap lifts. */}
      <div className="absolute inset-0 rounded-sm bg-[#e6dfcf] shadow-md ring-1 ring-black/5 dark:shadow-black/50" />

      <div
        className="absolute inset-x-[7%] top-[5%] h-[85%] rounded-[2px] bg-[#fbf9f4] px-[7%] py-[6%] shadow-sm ring-1 ring-black/5 motion-reduce:transition-none"
        style={{
          transform: `translateZ(1px) translateY(${opened ? -60 : 0}%)`,
          // Out after the flap clears; back in before it closes.
          transition: `transform 700ms ${GLIDE} ${opened ? 420 : 0}ms`,
        }}
      >
        <p className="font-serif text-sm sm:text-base">My dear friend,</p>
        <p className="mt-2 font-serif text-[11px] leading-relaxed opacity-75 sm:text-xs">
          The frescoes are finished at last. Come and see them before the scaffolding comes down.
        </p>
        <p className="mt-2 text-right font-serif text-sm sm:text-base">A.</p>
      </div>

      {/* Side and bottom folds: the pocket, cut away where the flap lies. */}
      <svg
        aria-hidden
        viewBox="0 0 700 500"
        preserveAspectRatio="none"
        className="absolute inset-0 size-full"
        style={{ transform: "translateZ(2px)" }}
      >
        <path d="M0 0 L350 280 L700 0 L700 500 L0 500 Z" fill="#F4F1EA" />
        <path
          d="M0 500 L330 290 M700 500 L370 290"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.16"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>

      <div
        className="absolute inset-x-0 top-0 h-[56%] [transform-style:preserve-3d] motion-reduce:transition-none"
        style={{
          transformOrigin: "50% 0 0",
          transform: `rotateX(${opened ? 180 : 0}deg) translateZ(3px)`,
          transition: `transform 600ms ${GLIDE} ${opened ? 220 : 380}ms`,
        }}
      >
        <div
          className="absolute inset-0 bg-[#ece6d8] [backface-visibility:hidden]"
          style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }}
        >
          <p className="absolute inset-x-0 top-5 text-center font-serif text-sm opacity-60">From the atelier</p>
        </div>
        {/* Inside face, pre-flipped so it reads right way up once the flap is open. */}
        <div
          className="absolute inset-0 bg-[#ddd5c3] [backface-visibility:hidden]"
          style={{ clipPath: "polygon(50% 0, 100% 100%, 0 100%)", transform: "rotateX(180deg)" }}
        />
      </div>

      <div
        className="absolute top-[56%] left-1/2 -translate-x-1/2 -translate-y-[52px]"
        style={{ transform: "translateZ(4px)" }}
      >
        {children}
      </div>
    </div>
  )
}

export function WaxSealDemo() {
  const [variant, setVariant] = React.useState<"seal" | "open">("seal")
  const [color, setColor] = React.useState(waxSealColors.oxblood)
  const [holdDuration, setHoldDuration] = React.useState(1100)
  const [impression, setImpression] = React.useState<"letter" | "rosette">("letter")
  const [breakable, setBreakable] = React.useState(false)
  const [sealed, setSealed] = React.useState(false)

  const isOpen = variant === "open"
  // The seal variant starts bare, the open variant starts stamped.
  const pristine = sealed === isOpen

  return (
    <DemoPanel>
      <DemoStage>
        <div className={cn("w-full max-w-md [perspective:1400px]", isOpen && "pt-[44%]")}>
          <Envelope opened={isOpen && !sealed}>
            <WaxSeal
              key={variant}
              variant={variant}
              color={color}
              holdDuration={holdDuration}
              sealed={sealed}
              onSealedChange={setSealed}
              resetOnClick={breakable}
              size={88}
            >
              {impression === "letter" ? <span className="font-serif text-[1.45em]">A</span> : <Rosette />}
            </WaxSeal>
          </Envelope>
        </div>
      </DemoStage>
      <DemoControls>
        <Choice
          label="Variant"
          value={variant}
          options={variantOptions}
          onChange={(v) => {
            setVariant(v)
            setSealed(v === "open")
          }}
        />
        <Swatches label="Wax" value={color} options={colorOptions} onChange={setColor} />
        <Range
          label="Hold"
          value={holdDuration}
          onChange={setHoldDuration}
          min={400}
          max={2500}
          step={100}
          format={(v) => `${v} ms`}
        />
        <Choice label="Impression" value={impression} options={impressionOptions} onChange={setImpression} />
        {!isOpen && <Toggle label="Click to break" checked={breakable} onChange={setBreakable} />}
        <Button
          variant="outline"
          size="sm"
          className="mt-auto"
          onClick={() => setSealed(isOpen)}
          disabled={pristine}
        >
          <HugeiconsIcon icon={RefreshIcon} />
          Reset
        </Button>
      </DemoControls>
    </DemoPanel>
  )
}
