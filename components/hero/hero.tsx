import { HugeiconsIcon } from "@hugeicons/react"
import { GithubIcon } from "@hugeicons/core-free-icons"

import { GITHUB_URL, installName, type ItemSummary } from "@/lib/registry"
import { GOLD, PillLink, delay } from "@/components/home-primitives"
import { TestStrip, type BandInfo } from "@/components/home/test-strip"
import { GoldLeaf } from "@/registry/new-york/blocks/gold-leaf/gold-leaf"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"

/* Hero: the top of a proof sheet. A slug line, one sentence that says the registry has two sides,
   and the test strip: a single painting printed six ways by six of the components. The plate is
   wider than the text column on purpose, the way a catalogue lets its plates run past the type. */

function firstSentence(text: string) {
  return text.split(/(?<=\.)\s/)[0] ?? text
}

export function Hero({ items }: { items: ItemSummary[] }) {
  const skills = items.filter((i) => i.kind === "skill").length
  const components = items.length - skills
  const info: Record<string, BandInfo> = Object.fromEntries(
    items.map((i) => [
      i.name,
      { title: i.title, blurb: firstSentence(i.description), command: `npx shadcn@latest add ${installName(i.name)}` },
    ])
  )

  return (
    <section className="relative isolate overflow-hidden border-b bg-paper">
      <GrainOverlay opacity={0.14} className="-z-10" />

      <div className="mx-auto w-full max-w-5xl px-4 pt-6 sm:px-8 sm:pt-8">
        <p className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-foreground/15 pb-3 font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase">
          <span>
            <span className="text-foreground">Proof sheet</span> · {components} components · {skills} Claude skills
          </span>
          <span>Open source · MIT</span>
        </p>

        {/* From sm up the heading is two lines: the statement, then the two names. The size is set so
            the first line always fits the column; on a phone it wraps instead of shrinking. */}
        <h1 className="cc-rise mt-8 font-serif text-[clamp(1.875rem,9.4vw,3.75rem)] leading-[0.96] tracking-[-0.03em] text-balance sm:mt-10 sm:text-[clamp(2.5rem,6.5vw,4.375rem)]">
          <span className="sm:block sm:whitespace-nowrap">One registry, two collections:</span>{" "}
          <GoldLeaf lay leafSize={40} cracks={0.25} className="whitespace-nowrap">
            classical and modern.
          </GoldLeaf>
        </h1>

        <div className="cc-rise mt-7 grid gap-x-10 gap-y-6 md:grid-cols-12 md:items-end" style={delay(120)}>
          {/* em, not ch: a ch width follows the font's "0", so it resized (a layout shift) when Geist loaded. */}
          <p className="max-w-[34em] leading-relaxed text-pretty text-muted-foreground md:col-span-6">
            React components and Claude skills by Krutik Raut. Each one installs with a single shadcn command and
            lands in your repo as a file you own.
          </p>
          <div className="flex flex-wrap gap-3 md:col-span-6 md:justify-end">
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
      </div>

      <div className="cc-rise mx-auto w-full max-w-[1280px] px-4 pt-12 pb-12 sm:px-8 sm:pt-14" style={delay(240)}>
        <TestStrip info={info} />
      </div>
    </section>
  )
}
