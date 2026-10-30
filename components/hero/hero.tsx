import { HugeiconsIcon } from "@hugeicons/react"
import { GithubIcon } from "@hugeicons/core-free-icons"

import { GITHUB_URL, NAMESPACE, type ItemSummary } from "@/lib/registry"
import { Eyebrow, GOLD, PillLink, delay } from "@/components/home-primitives"
import { HeroPainting } from "@/components/hero/hero-painting"
import { HeroPieces } from "@/components/hero/hero-pieces"
import { HeroStage } from "@/components/hero/hero-stage"
import { HeroTrail } from "@/components/hero/hero-trail"
import { LiveTerminal } from "@/components/hero/live-terminal"
import { GoldLeaf } from "@/registry/new-york/blocks/gold-leaf/gold-leaf"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"

/* Hero: a hand sets the keystone. One piece, and the arch holds.
   The painting is printed across the stage as a halftone engraving; moving the
   pointer leaves a trail of paintings in full colour. The collection floats
   around the stage as cut-outs, waiting to be placed. */

export function Hero({ items }: { items: ItemSummary[] }) {
  const terminalItems = items.map((i) => ({ name: i.name, files: i.fileCount, kind: i.kind }))
  const skills = items.filter((i) => i.kind === "skill").length
  const components = items.length - skills

  return (
    <HeroStage className="border-b bg-[#F4F2EE] dark:bg-transparent">
      {/* Paper: drifting varnish light, the engraved painting, a scrim for the type, grain. */}
      <div aria-hidden className="hero-varnish -z-10" />
      <HeroPainting />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70%] bg-gradient-to-b from-[#F4F2EE] via-[#F4F2EE]/95 via-60% to-transparent dark:from-background dark:via-background/95"
      />
      <GrainOverlay opacity={0.14} className="-z-10" />
      <HeroTrail />

      <HeroPieces />

      <div className="hero-exit relative z-10 mx-auto flex min-h-[calc(100svh-6rem)] w-full max-w-6xl flex-col items-center px-4 pt-10 sm:px-8 lg:pt-14">
        {/* The copy and buttons stay clear of the cursor trail. */}
        <div data-trail-quiet className="flex w-fit max-w-full flex-col items-center">
          <Eyebrow className="cc-rise text-center">
            {components} components · {skills} skills · Open source
          </Eyebrow>

          <h1 className="mt-5 text-center font-serif text-[clamp(2.3rem,5.6vw,4.75rem)] leading-[0.92] tracking-[-0.025em] text-balance">
            <span className="cc-reveal block">
              <span style={delay(120)}>
                <GoldLeaf lay leafSize={40} cracks={0.25}>
                  Timeless craft.
                </GoldLeaf>
              </span>
            </span>
            <span className="cc-reveal block">
              <span style={delay(260)}>
                <GoldLeaf lay tone="white" leafSize={40} cracks={0.25} seed={12} layDuration={2000}>
                  One command away.
                </GoldLeaf>
              </span>
            </span>
          </h1>

          {/* em, not ch: a ch width follows the font's "0", so it resized (a layout shift) when Geist loaded. */}
          <p
            className="cc-rise mt-6 max-w-[30.5em] text-center text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
            style={delay(420)}
          >
            React components and Claude skills by Krutik Raut, made with a designer’s eye. Install any of them into
            your project with the shadcn CLI.
          </p>

          <div className="cc-rise mt-8 flex flex-wrap justify-center gap-3" style={delay(540)}>
            <PillLink href="/docs" variant="solid">
              <span className="size-1.5 rounded-full" style={{ backgroundColor: GOLD }} />
              Browse the registry
            </PillLink>
            <PillLink href={GITHUB_URL} external>
              <HugeiconsIcon icon={GithubIcon} className="size-4" strokeWidth={2} />
              Star on GitHub
            </PillLink>
          </div>
        </div>

        {/* Stage: the engraved painting rises behind; the terminal and cue sit on it. */}
        <div className="relative mt-auto h-[clamp(240px,36svh,400px)] w-full">
          <div
            className="hero-depth cc-rise absolute bottom-8 left-4 sm:left-[max(1rem,calc(50%-520px))]"
            style={{ "--depth": 0.6, "--cc-delay": "700ms" } as React.CSSProperties}
          >
            <div className="cc-float" style={{ rotate: "1.5deg" }}>
              <LiveTerminal items={terminalItems} namespace={NAMESPACE} />
            </div>
          </div>

          <a
            href="#overview"
            aria-label="Scroll to the overview"
            className="cc-rise absolute right-4 bottom-8 hidden items-center gap-3 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase transition-colors hover:text-foreground sm:right-8 sm:flex"
            style={delay(900)}
          >
            Scroll
            <span className="relative block h-12 w-px overflow-hidden bg-border">
              <span className="hero-cue absolute inset-0 bg-foreground/70" />
            </span>
          </a>
        </div>
      </div>

      <Ticker names={items.map((i) => i.name)} />
    </HeroStage>
  )
}

/** A slow strip of install commands along the bottom edge. */
function Ticker({ names }: { names: string[] }) {
  const entries = names.length ? names : ["name"]
  const row = (key: string) => (
    <ul key={key} className="flex shrink-0 items-center" aria-hidden={key === "b"}>
      {entries.map((name) => (
        <li key={name} className="flex items-center gap-10 pr-10 font-mono text-[11px] tracking-[.08em] whitespace-nowrap uppercase">
          <span className="text-muted-foreground">
            <span className="text-foreground/70">npx shadcn add</span> {NAMESPACE}/{name}
          </span>
          <span aria-hidden className="size-1 rounded-full" style={{ backgroundColor: GOLD }} />
        </li>
      ))}
    </ul>
  )
  return (
    <div className="relative z-10 h-10 overflow-hidden border-t bg-background/40 backdrop-blur-sm [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
      <div className="hero-ticker flex h-full items-center">
        {row("a")}
        {row("b")}
      </div>
    </div>
  )
}
