"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { ColourBar, CommandLine, PlateMarks } from "@/components/home/sheet"

/* The hero plate: one picture shown as a test strip. Each band is the same picture rendered live
   by a different registry component, so the collection is the first thing on the page. Pointing
   at a band widens it; the caption underneath names it and gives its command. The bands
   themselves live in plate-classic.tsx. */

export type Band = {
  /** Registry item name: the band links to its docs and takes its title and command from it. */
  name: string
  render: React.ReactNode
  /** Live bands keep their own pointer handling; the rest are stills and ignore the pointer. */
  live?: boolean
}

/** Share of the plate the band under the pointer takes. */
const WIDE = 40
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

/** Left edge of every band (plus the right edge of the last), in percent of the plate. */
function edges(active: number | null, N: number) {
  if (active === null) return Array.from({ length: N + 1 }, (_, i) => (i / N) * 100)
  const narrow = (100 - WIDE) / (N - 1)
  const out = [0]
  for (let i = 0; i < N; i++) out.push(out[i] + (i === active ? WIDE : narrow))
  return out
}

export type BandInfo = { title: string; blurb: string; command: string }

export function TestStrip({
  bands: BANDS,
  info,
  caption,
  className,
}: {
  bands: Band[]
  info: Record<string, BandInfo>
  /** What the picture is, set after "Plate 1". */
  caption: string
  className?: string
}) {
  const N = BANDS.length
  const [active, setActive] = React.useState<number | null>(null)
  // The caption keeps the last band pointed at, so it never goes blank.
  const [shown, setShown] = React.useState(1)
  const touch = React.useRef(false)

  const pick = (i: number) => {
    setActive(i)
    setShown(i)
  }
  const x = edges(active, N)
  const current = BANDS[shown]
  const meta = info[current.name]

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between gap-4 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">
        <p>
          <span className="text-foreground">Plate 1</span> · {caption}
          <span className="max-sm:hidden"> · one picture, {N} components</span>
        </p>
        <ColourBar className="shrink-0" />
      </div>

      {/* In modern the plate sits in a raised tile, with its letters inside the tile's lip. */}
      <div className="relative modern:soft-surface modern:rounded-[32px] modern:p-2.5 modern:pb-3.5">
        <PlateMarks />
        <div
          className="relative aspect-[5/4] overflow-hidden bg-[#f4f1ea] sm:aspect-[1200/470] modern:rounded-[23px]"
          onPointerLeave={(e) => e.pointerType !== "touch" && setActive(null)}
        >
          {BANDS.map((band, i) => (
            <Link
              key={band.name}
              href={`/docs/${band.name}`}
              aria-label={`${info[band.name]?.title ?? band.name}: open the docs`}
              className="absolute inset-0 block outline-none motion-reduce:transition-none"
              style={{
                // A 1px gutter each side leaves a paper hairline between bands.
                clipPath: `inset(0 calc(${100 - x[i + 1]}% + ${i < N - 1 ? 1 : 0}px) 0 calc(${x[i]}% + ${i > 0 ? 1 : 0}px))`,
                transition: `clip-path 650ms ${EASE}`,
              }}
              onPointerDown={(e) => (touch.current = e.pointerType === "touch")}
              onPointerEnter={(e) => e.pointerType !== "touch" && pick(i)}
              onFocus={() => pick(i)}
              onBlur={() => setActive(null)}
              onClick={(e) => {
                // On touch the first tap opens the band, the second follows the link.
                if (touch.current && active !== i) {
                  e.preventDefault()
                  pick(i)
                }
              }}
            >
              <div className={cn("absolute inset-0", !band.live && "pointer-events-none")}>{band.render}</div>
            </Link>
          ))}
        </div>

        {/* Band letters, hung under the plate and moving with the edges above them. */}
        <div
          aria-hidden
          className="relative mt-2.5 h-4 overflow-hidden font-mono text-[10px] tracking-[.08em] uppercase modern:mx-3 modern:mt-3"
        >
          {BANDS.map((band, i) => (
            <div
              key={band.name}
              className="pointer-events-none absolute inset-0 motion-reduce:transition-none"
              style={{ transform: `translateX(${x[i]}%)`, transition: `transform 650ms ${EASE}` }}
            >
              <span
                className={cn(
                  "flex items-baseline gap-2 whitespace-nowrap transition-colors duration-200",
                  shown === i ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <span className="text-foreground">{String.fromCharCode(65 + i)}</span>
                <span className={cn(active !== i && "max-md:hidden")}>{band.name}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-x-10 gap-y-5 border-t pt-5 md:grid-cols-12 modern:border-t-0 modern:px-3 modern:pt-2">
        <div className="md:col-span-7">
          <p className="font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">
            Band {String.fromCharCode(65 + shown)}
            <span className="[@media(hover:none)]:hidden"> · point at a band to change it</span>
            <span className="[@media(hover:hover)]:hidden"> · tap a band to change it</span>
          </p>
          <p className="mt-2 max-w-[58ch] text-pretty text-muted-foreground">
            <span className="font-serif text-xl tracking-[-0.01em] text-foreground">{meta?.title}.</span>{" "}
            {meta?.blurb}
          </p>
        </div>
        <div className="flex min-w-0 flex-col justify-end gap-3 md:col-span-5">
          <CommandLine command={meta?.command ?? ""} />
          <Link
            href={`/docs/${current.name}`}
            className="group inline-flex items-center gap-1 self-start font-mono text-[11px] tracking-[.08em] uppercase underline-offset-4 hover:underline"
          >
            Props and live controls
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
              strokeWidth={2}
            />
          </Link>
        </div>
      </div>
    </div>
  )
}
