"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { ColourBar, CommandLine, PlateMarks } from "@/components/home/sheet"
import { Cyanotype } from "@/registry/new-york/blocks/cyanotype/cyanotype"
import { DitheringHover } from "@/registry/new-york/blocks/dithering-hover/dithering-hover"
import { DuotoneImage } from "@/registry/new-york/blocks/duotone-image/duotone-image"
import { Etching } from "@/registry/new-york/blocks/etching/etching"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"
import { HalftoneImage } from "@/registry/new-york/blocks/halftone-image/halftone-image"

/* The hero plate: one painting printed as a darkroom test strip. Each band is the same picture
   rendered live by a different registry component, so the collection is the first thing on the
   page. Pointing at a band widens it; the caption underneath names it and gives its command. */

const SRC = "/demo/venus-frieze.webp"
const PAPER = "#f4f1ea"
const INK = "#241d17"
const FILL = "absolute inset-0 size-full"
/* The canvas components take the image's aspect ratio by default; the plate sets its own. */
const AUTO = { aspectRatio: "auto" } as const

/* `live` bands keep their own pointer handling; the rest are stills and ignore the pointer. */
const BANDS: { name: string; render: React.ReactNode; live?: boolean }[] = [
  {
    name: "grain-overlay",
    render: (
      <div className={FILL}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SRC} alt="" draggable={false} className="size-full object-cover" />
        <GrainOverlay opacity={0.4} />
      </div>
    ),
  },
  {
    name: "halftone-image",
    render: (
      <HalftoneImage src={SRC} dotSize={5} angle={32} contrast={1.2} color={INK} background={PAPER} className={FILL} style={AUTO} />
    ),
  },
  {
    name: "duotone-image",
    render: <DuotoneImage src={SRC} shadow="#17494d" highlight="#f6e6c4" contrast={1.2} className={FILL} style={AUTO} />,
  },
  { name: "etching", render: <EngravedBand /> },
  {
    name: "cyanotype",
    render: (
      <Cyanotype src={SRC} preset="classic" contrast={1.15} roughness={0} margin={0} border={0} className={FILL} style={AUTO} />
    ),
  },
  {
    name: "dithering-hover",
    // The picture stays in colour and dithers under the pointer, as the component does on its own.
    live: true,
    render: (
      <DitheringHover
        src={SRC}
        zoneSize={470}
        dotSize={2}
        matrix={2}
        streaks={14}
        roughness={0.25}
        contrast={1.6}
        dark="#000000"
        light="#f5f2eb"
        className={FILL}
        style={AUTO}
      />
    ),
  },
]

/**
 * The etching cuts itself in when it comes on screen. Its own trigger waits for a third of the
 * plate to be visible, which a clipped band never reaches, so the band drives the progress.
 */
function EngravedBand() {
  const ref = React.useRef<HTMLDivElement>(null)
  const [progress, setProgress] = React.useState(0)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return setProgress(1)
    const DURATION = 2800
    let raf = 0
    let start = 0
    const tick = (now: number) => {
      start ||= now
      const t = Math.min(1, (now - start) / DURATION)
      setProgress(1 - (1 - t) ** 1.4)
      if (t < 1) raf = requestAnimationFrame(tick)
    }
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      raf = requestAnimationFrame(tick)
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={ref} className={FILL}>
      <Etching src={SRC} lineSpacing={4} angle={35} ink={INK} paper={PAPER} progress={progress} className={FILL} style={AUTO} />
    </div>
  )
}

const N = BANDS.length
/** Share of the plate the band under the pointer takes. */
const WIDE = 40
const EASE = "cubic-bezier(0.22, 1, 0.36, 1)"

/** Left edge of every band (plus the right edge of the last), in percent of the plate. */
function edges(active: number | null) {
  if (active === null) return Array.from({ length: N + 1 }, (_, i) => (i / N) * 100)
  const narrow = (100 - WIDE) / (N - 1)
  const out = [0]
  for (let i = 0; i < N; i++) out.push(out[i] + (i === active ? WIDE : narrow))
  return out
}

export type BandInfo = { title: string; blurb: string; command: string }

export function TestStrip({ info, className }: { info: Record<string, BandInfo>; className?: string }) {
  const [active, setActive] = React.useState<number | null>(null)
  // The caption keeps the last band pointed at, so it never goes blank.
  const [shown, setShown] = React.useState(1)
  const touch = React.useRef(false)

  const pick = (i: number) => {
    setActive(i)
    setShown(i)
  }
  const x = edges(active)
  const current = BANDS[shown]
  const meta = info[current.name]

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between gap-4 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">
        <p>
          <span className="text-foreground">Plate 1</span> · Botticelli, The Birth of Venus, c. 1485
          <span className="max-sm:hidden"> · one picture, {N} components</span>
        </p>
        <ColourBar className="shrink-0" />
      </div>

      <div className="relative">
        <PlateMarks />
        <div
          className="relative aspect-[5/4] overflow-hidden bg-[#f4f1ea] sm:aspect-[1200/470]"
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
        <div aria-hidden className="relative mt-2.5 h-4 overflow-hidden font-mono text-[10px] tracking-[.08em] uppercase">
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

      <div className="mt-6 grid gap-x-10 gap-y-5 border-t pt-5 md:grid-cols-12">
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
