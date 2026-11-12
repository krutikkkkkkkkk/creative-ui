"use client"

import * as React from "react"

import { TestStrip, type Band, type BandInfo } from "@/components/home/test-strip"
import { Cyanotype } from "@/registry/new-york/blocks/cyanotype/cyanotype"
import { DitheringHover } from "@/registry/new-york/blocks/dithering-hover/dithering-hover"
import { DuotoneImage } from "@/registry/new-york/blocks/duotone-image/duotone-image"
import { Etching } from "@/registry/new-york/blocks/etching/etching"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"
import { HalftoneImage } from "@/registry/new-york/blocks/halftone-image/halftone-image"

/* The classic plate: Botticelli's Venus printed six ways by the classical collection. */

const SRC = "/demo/venus-frieze.webp"
const PAPER = "#f4f1ea"
const INK = "#241d17"
const FILL = "absolute inset-0 size-full"
/* The canvas components take the image's aspect ratio by default; the plate sets its own. */
const AUTO = { aspectRatio: "auto" } as const

const BANDS: Band[] = [
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

export function ClassicPlate({ info }: { info: Record<string, BandInfo> }) {
  return <TestStrip bands={BANDS} info={info} caption="Botticelli, The Birth of Venus, c. 1485" />
}
