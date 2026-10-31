import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react"
import {
  AccessIcon,
  AiBrain01Icon,
  AiMagicIcon,
  ArrowRight01Icon,
  DarkModeIcon,
  GithubIcon,
  SourceCodeIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons"

import { GITHUB_URL, NAMESPACE, installName, installUrl, type ItemSummary } from "@/lib/registry"
import { cn } from "@/lib/utils"
import { InstallCommand } from "@/components/copy-command"
import { ItemCard } from "@/components/item-card"
import { PillLink } from "@/components/home-primitives"
import { CountUp } from "@/components/home/count-up"
import { SponsorsBand } from "@/components/home/sponsors-band"
import { Band, BandHeader, Label, Rails, enter } from "@/components/modern/primitives"
import { InstallStage, type StageItem } from "@/components/modern/install-stage"
import { StepGrid } from "@/components/modern/step-grid"

/* Home page in the modern look: Vercel-style boxed layout, hairline rails, Geist Sans, no paintings.
   The collection's own posters are the only imagery. */

const SHOWCASE = 6

/* Light running along the hero grid. The grid is centred, so its lines sit at 50% - 28px + k*56px
   across and k*56px down; each beam rides one of them. */
const GRID = 56
const BEAMS: { axis: "x" | "y"; line: number; dur: number; delay: number }[] = [
  { axis: "y", line: -6, dur: 7, delay: 0 },
  { axis: "y", line: 5, dur: 9, delay: 2600 },
  { axis: "y", line: -2, dur: 8, delay: 5200 },
  { axis: "x", line: 2, dur: 10, delay: 1400 },
  { axis: "x", line: 6, dur: 8, delay: 4200 },
]

const HEADLINE = [["Creative", "components,"], ["one", "command", "away."]]

const FEATURES: { icon: IconSvgElement; title: string; body: string }[] = [
  {
    icon: SourceCodeIcon,
    title: "Copied, not installed",
    body: "The shadcn CLI writes plain React and Tailwind into your repo. No package to update, no runtime dependency on this site.",
  },
  {
    icon: AiBrain01Icon,
    title: "Readable by AI tools",
    body: "Every item is plain JSON at /r/name.json with an llms.txt beside it, so v0, Cursor and Claude Code read it directly.",
  },
  {
    icon: AiMagicIcon,
    title: "Claude skills included",
    body: "Design skills install into .claude/skills, where Claude Code picks them up and works in your taste.",
  },
  {
    icon: SparklesIcon,
    title: "Effects with craft",
    body: "Halftone, duotone, cyanotype, etching and gold leaf: print-shop techniques, rebuilt as components.",
  },
  {
    icon: DarkModeIcon,
    title: "Your theme, both modes",
    body: "Components read your shadcn tokens, so they sit in light and dark mode without extra work.",
  },
  {
    icon: AccessIcon,
    title: "Motion that respects people",
    body: "Animations run on transform and opacity, and calm down for anyone who prefers reduced motion.",
  },
]

export function ModernHome({ items }: { items: ItemSummary[] }) {
  const skills = items.filter((i) => i.kind === "skill")
  const components = items.filter((i) => i.kind === "component")
  const first = skills[0] ?? components[0]
  const fresh = items.find((i) => i.isNew)
  const totalFiles = items.reduce((n, i) => n + i.fileCount, 0)
  // Components lead the showcase: their posters are the most visual.
  const showcase = [...components, ...skills].slice(0, SHOWCASE)
  const stage: StageItem[] = components
    .filter((i): i is ItemSummary & { poster: string } => Boolean(i.poster))
    .slice(0, SHOWCASE)
    .map(({ name, title, poster, fileCount }) => ({ name, title, poster, fileCount }))

  return (
    <div className="relative w-full overflow-x-clip pb-24">
      <Rails>
        {/* Hero */}
        <section className="relative isolate overflow-hidden px-4 pt-20 pb-16 text-center sm:px-10 sm:pt-28 sm:pb-20">
          <HeroGrid />
          <div
            aria-hidden
            className="absolute inset-x-0 -top-40 -z-10 mx-auto h-80 max-w-3xl rounded-full bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand)_22%,transparent),transparent)] blur-2xl"
          />

          {fresh ? (
            <Link
              href={`/docs/${fresh.name}`}
              className="mo-enter group inline-flex items-center gap-2 rounded-full border bg-background/70 py-1 pr-3 pl-1 text-xs backdrop-blur transition-colors hover:border-foreground/25"
            >
              <span className="rounded-full bg-brand px-2 py-0.5 font-medium text-white">New</span>
              <span className="text-muted-foreground transition-colors group-hover:text-foreground">{fresh.title}</span>
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-3 text-muted-foreground" strokeWidth={2} />
            </Link>
          ) : (
            <Label className="mo-enter">
              {components.length} components · {skills.length} skills · MIT
            </Label>
          )}

          <h1 className="mx-auto mt-6 text-[clamp(2.5rem,6.4vw,4.75rem)] leading-[1] font-semibold tracking-[-0.055em]">
            {HEADLINE.map((line, l) => (
              <span key={l} className={cn("block", l === 1 && "text-foreground/45")}>
                {line.map((word, w) => (
                  <React.Fragment key={word}>
                    <span className="mo-enter inline-block" style={enter(60 + (l * 2 + w) * 45)}>
                      {word}
                    </span>
                    {w < line.length - 1 && " "}
                  </React.Fragment>
                ))}
              </span>
            ))}
          </h1>
          <p
            className="mo-enter mx-auto mt-6 max-w-[34em] text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
            style={enter(120)}
          >
            React components and Claude skills by Krutik Raut, made with a designer’s eye. Install any of them into your
            project with the shadcn CLI.
          </p>

          <div className="mo-enter mt-9 flex flex-wrap justify-center gap-3" style={enter(180)}>
            <PillLink href="/docs" variant="solid">
              Browse components
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
            </PillLink>
            <PillLink href={GITHUB_URL} external>
              <HugeiconsIcon icon={GithubIcon} className="size-4" strokeWidth={2} />
              Star on GitHub
            </PillLink>
          </div>

          {stage.length > 0 && (
            <div className="mx-auto mt-14 max-w-5xl sm:mt-16">
              <InstallStage items={stage} namespace={NAMESPACE} />
            </div>
          )}
        </section>

        {/* Stats */}
        <Band>
          <dl id="overview" className="grid scroll-mt-16 grid-cols-2 sm:grid-cols-4">
            <Stat value={components.length} label="Components" className="border-r" />
            <Stat value={skills.length} label="Claude skills" className="sm:border-r" />
            <Stat value={totalFiles} label="Files you own" className="border-t border-r sm:border-t-0" />
            <Stat value="MIT" label="License" className="border-t sm:border-t-0" />
          </dl>
        </Band>

        {/* Collection */}
        <Band className="px-6 py-16 sm:px-10 sm:py-20">
          <BandHeader
            label="The collection"
            title="Pieces worth keeping."
            description="Image effects, carousels and reveals, each one a single file you can read, restyle and ship."
            action={<ArrowLink href="/docs">Browse all {items.length}</ArrowLink>}
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {showcase.map((item, i) => (
              <li key={item.name} className="mo-enter" style={enter(i * 50)}>
                <ItemCard item={item} />
              </li>
            ))}
          </ul>
        </Band>

        {/* Features */}
        <Band>
          <div className="px-6 pt-16 sm:px-10 sm:pt-20">
            <BandHeader
              label="Why creative-ui"
              title="Built like the rest of your stack."
              description="Nothing to learn and nothing to keep updated. It behaves like code you wrote yourself."
            />
          </div>
          <div className="mt-10 grid gap-px border-t bg-border sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-background p-6 sm:p-8">
                <HugeiconsIcon icon={f.icon} className="size-5 text-foreground" strokeWidth={1.75} />
                <h3 className="mt-5 font-semibold tracking-[-0.02em]">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </Band>

        {/* How it works */}
        <Band id="how-it-works" className="px-6 py-16 sm:px-10 sm:py-20">
          <BandHeader label="How it works" title="Three steps. No setup." />
          <StepGrid
            className="mt-10"
            steps={[
              {
                n: "01",
                title: "Pick a piece",
                body: "Browse the collection and open any item for a live preview, its props and every file it adds.",
              },
              {
                n: "02",
                title: "Run one command",
                body: "The shadcn CLI resolves the item and writes its files straight into your project.",
                visual: (
                  <code className="block truncate rounded-md border bg-muted px-3 py-2 font-mono text-xs">
                    npx shadcn add {NAMESPACE}/{first?.name ?? "name"}
                  </code>
                ),
              },
              {
                n: "03",
                title: "Make it yours",
                body: "Rename it, restyle it, delete half of it. What lands in your repo is plain React and Tailwind.",
              },
            ]}
          />
        </Band>

        {/* Installation */}
        <Band id="installation" className="px-6 py-16 sm:px-10 sm:py-20">
          <BandHeader label="Installation" title="Two ways in." />
          <div className="mt-10 grid gap-8 lg:grid-cols-2">
            <div className="min-w-0">
              <h3 className="font-semibold tracking-[-0.02em]">Install by name</h3>
              <p className="mt-1.5 mb-4 text-sm text-muted-foreground">
                <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{NAMESPACE}</code> is in the shadcn
                registry directory. Works in any project.
              </p>
              <InstallCommand target={installName(first?.name ?? "<name>")} />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold tracking-[-0.02em]">Or install by URL</h3>
              <p className="mt-1.5 mb-4 text-sm text-muted-foreground">For older versions of the shadcn CLI.</p>
              <InstallCommand target={installUrl(first?.name ?? "<name>")} />
            </div>
          </div>
        </Band>

        {/* Sponsors: the shared band, set in this look's type by the tokens. */}
        <Band className="px-6 sm:px-10 [&>section]:border-t-0">
          <SponsorsBand />
        </Band>

        {/* Closing call to action */}
        <Band className="relative isolate overflow-hidden px-6 py-20 text-center sm:py-28">
          <div
            aria-hidden
            className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:56px_56px] [mask-image:radial-gradient(ellipse_60%_70%_at_50%_100%,black,transparent)]"
          />
          <h2 className="mx-auto max-w-[18ch] text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-5xl">
            Build something worth keeping.
          </h2>
          <p className="mx-auto mt-5 max-w-[48ch] leading-relaxed text-pretty text-muted-foreground">
            Free, open source and MIT licensed. Every item is plain JSON at{" "}
            <span className="font-mono text-[13px] text-foreground">/r/[name].json</span>.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <PillLink href="/docs" variant="solid">
              Get started
            </PillLink>
            <PillLink href="/r/registry.json" external>
              View registry.json
            </PillLink>
          </div>
        </Band>
      </Rails>
    </div>
  )
}

/** The hero's centred grid, with beams of light running along a few of its lines. */
function HeroGrid() {
  const mask = "[mask-image:radial-gradient(ellipse_75%_65%_at_50%_0%,black,transparent)]"
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 -z-10", mask)}>
      <div
        className="absolute inset-0 bg-[linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)]"
        style={{ backgroundSize: `${GRID}px ${GRID}px`, backgroundPosition: "50% 0" }}
      />
      {BEAMS.map((b, i) => (
        <div
          key={i}
          className={cn("absolute overflow-hidden", b.axis === "y" ? "inset-y-0 w-px" : "inset-x-0 h-px")}
          style={
            b.axis === "y"
              ? { left: `calc(50% - ${GRID / 2}px + ${b.line * GRID}px)` }
              : { top: `${b.line * GRID}px` }
          }
        >
          <div
            className={cn("absolute inset-0", b.axis === "y" ? "mo-beam-y" : "mo-beam-x")}
            style={{ "--mo-dur": `${b.dur}s`, "--mo-delay": `${b.delay}ms` } as React.CSSProperties}
          />
        </div>
      ))}
    </div>
  )
}

function Stat({ value, label, className }: { value: string | number; label: string; className?: string }) {
  return (
    <div className={cn("flex flex-col-reverse gap-1 px-6 py-8 sm:px-10", className)}>
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-4xl font-semibold tracking-[-0.05em] tabular-nums sm:text-5xl">
        <CountUp value={value} />
      </dd>
    </div>
  )
}

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="group inline-flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
    >
      {children}
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        className="size-4 transition-transform duration-200 group-hover:translate-x-0.5"
        strokeWidth={2}
      />
    </Link>
  )
}
