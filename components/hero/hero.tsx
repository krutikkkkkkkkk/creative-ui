import { HugeiconsIcon } from "@hugeicons/react"
import { GithubIcon } from "@hugeicons/core-free-icons"

import { GITHUB_URL, installName, type ItemSummary } from "@/lib/registry"
import type { UiStyle } from "@/lib/ui-style"
import { GOLD, PillLink, delay } from "@/components/home-primitives"
import { ClassicPlate } from "@/components/home/plate-classic"
import type { BandInfo } from "@/components/home/test-strip"
import { GoldLeaf } from "@/registry/new-york/blocks/gold-leaf/gold-leaf"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"

/* Hero: the top of a proof sheet. A slug line, one sentence that says the registry has two sides,
   and the test strip: a single picture treated six ways by six components of the look's own
   collection (a painting in classic, a photograph in modern). In classic the plate is wider than
   the text column on purpose, the way a catalogue lets its plates run past the type. */

function firstSentence(text: string) {
  return text.split(/(?<=\.)\s/)[0] ?? text
}

export function Hero({ items, style }: { items: ItemSummary[]; style: UiStyle }) {
  const skills = items.filter((i) => i.kind === "skill").length
  const components = items.length - skills
  const info: Record<string, BandInfo> = Object.fromEntries(
    items.map((i) => [
      i.name,
      { title: i.title, blurb: firstSentence(i.description), command: `npx shadcn@latest add ${installName(i.name)}` },
    ])
  )

  return (
    <section className="relative isolate overflow-hidden border-b bg-paper modern:border-b-0">
      <GrainOverlay opacity={0.14} className="-z-10 modern:hidden" />
      {/* Modern has no paper: a faint wash of the accent sits behind the heading instead. */}
      <div
        aria-hidden
        className="absolute inset-x-0 -top-40 -z-10 mx-auto h-[30rem] max-w-5xl bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand)_14%,transparent),transparent)] classic:hidden"
      />

      <div className="mx-auto w-full px-4 pt-6 sm:pt-8 classic:max-w-5xl classic:sm:px-8 modern:max-w-[74rem]">
        <p className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 border-b border-foreground/15 pb-3 modern:border-b-0 modern:pb-0 font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase">
          <span>
            <span className="text-foreground">Proof sheet</span> · {components} components · {skills} Claude skills
          </span>
          <span>Open source · MIT</span>
        </p>

        {/* From sm up the heading is two lines: the statement, then the two names. The size is set so
            the first line always fits the column; on a phone it wraps instead of shrinking. */}
        <h1 className="cc-rise mt-8 font-serif text-[clamp(1.875rem,9.4vw,3.75rem)] leading-[0.96] tracking-[-0.03em] text-balance sm:mt-10 sm:text-[clamp(2.5rem,6.5vw,4.375rem)]">
          <span className="sm:block sm:whitespace-nowrap">One registry, two collections:</span>{" "}
          {style === "modern" ? (
            <span className="whitespace-nowrap text-foreground/40">classical and modern.</span>
          ) : (
            <GoldLeaf lay leafSize={40} cracks={0.25} className="whitespace-nowrap">
              classical and modern.
            </GoldLeaf>
          )}
        </h1>

        <div className="cc-rise mt-7 grid gap-x-10 gap-y-6 md:grid-cols-12 md:items-end" style={delay(120)}>
          {/* em, not ch: a ch width follows the font's "0", so it resized (a layout shift) when Geist loaded. */}
          <p className="max-w-[34em] leading-relaxed text-pretty text-muted-foreground md:col-span-6">
            React components and Claude skills by Krutik Raut. Each one installs with a single shadcn command and
            lands in your repo as a file you own.
          </p>
          <div className="flex flex-wrap gap-3 md:col-span-6 md:justify-end">
            <PillLink href="/docs" variant="solid">
              <span className="size-1.5 rounded-full modern:hidden" style={{ backgroundColor: GOLD }} />
              Browse the registry
            </PillLink>
            <PillLink href={GITHUB_URL} external>
              <HugeiconsIcon icon={GithubIcon} className="size-4" strokeWidth={2} />
              Star on GitHub
            </PillLink>
          </div>
        </div>
      </div>

      <div
        className="cc-rise mx-auto w-full px-4 pt-12 sm:pt-14 classic:max-w-[1280px] classic:pb-12 classic:sm:px-8 modern:max-w-[74rem] modern:pb-4"
        style={delay(240)}
      >
        <ClassicPlate info={info} />
      </div>
    </section>
  )
}
