import Link from "next/link"

import { cn } from "@/lib/utils"
import { CollageFrame } from "@/registry/new-york/blocks/collage-frame/collage-frame"
import { DuotoneImage } from "@/registry/new-york/blocks/duotone-image/duotone-image"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"
import { HalftoneImage } from "@/registry/new-york/blocks/halftone-image/halftone-image"

/* Cut-out collage pieces floating around the hero. Each one is rendered by the
   registry component it links to, so the collection is on stage before you scroll. */

type Piece = {
  name: string
  caption: string
  className: string
  depth: number
  tilt: number
  duration: string
  delay: string
  render: React.ReactNode
}

const PIECES: Piece[] = [
  {
    name: "halftone-image",
    caption: "halftone-image",
    className: "left-[3%] top-[13%] hidden md:block xl:left-[7%]",
    depth: 1.25,
    tilt: -5,
    duration: "9s",
    delay: "-2s",
    render: (
      <HalftoneImage
        src="/demo/bust.jpg"
        alt="Marble bust rendered as a halftone print"
        dotSize={3.5}
        contrast={1.25}
        color="#111"
        background="#F4F1EA"
        className="aspect-[4/5] w-[128px] rounded-[3px] shadow-[0_24px_48px_-16px_rgba(0,0,0,0.45)] lg:w-[150px]"
      />
    ),
  },
  {
    name: "collage-frame",
    caption: "collage-frame",
    className: "right-[3%] top-[11%] hidden md:block xl:right-[7%]",
    depth: 1,
    tilt: 3.5,
    duration: "11s",
    delay: "-5s",
    render: (
      <CollageFrame
        src="/demo/portrait.jpg"
        alt="Girl with a Pearl Earring in a gilt museum frame"
        shape="museum"
        frameColor="#b08d4a"
        frameWidth={10}
        matWidth={12}
        className="aspect-[4/5] w-[124px] lg:w-[146px]"
      />
    ),
  },
  {
    name: "duotone-image",
    caption: "duotone-image",
    className: "left-[2%] bottom-[29%] hidden lg:block xl:left-[6%]",
    depth: 0.7,
    tilt: 2.5,
    duration: "13s",
    delay: "-8s",
    render: (
      <DuotoneImage preset="sepia" offset={1.5} className="aspect-[3/2] w-[220px]">
        <CollageFrame
          src="/demo/venus.jpg"
          alt="The Birth of Venus as a sepia duotone on torn paper"
          shape="torn"
          roughness={0.6}
          seed={3}
          className="size-full"
        />
      </DuotoneImage>
    ),
  },
  {
    name: "grain-overlay",
    caption: "grain-overlay",
    className: "right-[2%] bottom-[16%] hidden lg:block xl:right-[6%]",
    depth: 0.85,
    tilt: -3,
    duration: "10s",
    delay: "-3s",
    render: (
      <CollageFrame
        src="/demo/painting.jpg"
        alt="The Death of Socrates in an oval cut-out with film grain"
        shape="oval"
        className="aspect-[4/5] w-[150px]"
      >
        <GrainOverlay variant="fiber" opacity={0.5} className="rounded-[50%]" />
      </CollageFrame>
    ),
  },
]

export function HeroPieces() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
      {PIECES.map((p, i) => (
        <Link
          key={p.name}
          href={`/docs/${p.name}`}
          tabIndex={-1}
          className={cn("hero-depth cc-rise group pointer-events-auto absolute", p.className)}
          style={{ "--depth": p.depth, "--cc-delay": `${500 + i * 120}ms` } as React.CSSProperties}
        >
          <div
            className="cc-float transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
            style={{ animationDuration: p.duration, animationDelay: p.delay }}
          >
            <div style={{ rotate: `${p.tilt}deg` }}>{p.render}</div>
            <span className="mt-3 block text-center font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase transition-colors group-hover:text-foreground">
              {"// "}
              {p.caption}
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
