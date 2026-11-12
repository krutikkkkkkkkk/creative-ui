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
import { Band, BandHeader, Label, Quiet, Rails, Tile, enter } from "@/components/modern/primitives"
import { StepGrid } from "@/components/modern/step-grid"

/* Home page in the modern look: soft and tactile. A grey canvas, raised white tiles with large
   corners, Geist Sans, and one warm-to-cool gradient kept for the things worth pressing.
   It shows the modern collection (items tagged `meta.look: "modern"` plus the shared ones). */

const SHOWCASE = 6

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
    title: "One file each",
    body: "A component is a single file with its behaviour inside it, so there is nothing to wire up and nothing hidden.",
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
  // The install examples name a component: this collection leads with them, not with skills.
  const first = components[0] ?? skills[0]
  const fresh = items.find((i) => i.isNew)
  const totalFiles = items.reduce((n, i) => n + i.fileCount, 0)
  // Components lead the showcase: their posters are the most visual.
  const showcase = [...components, ...skills].slice(0, SHOWCASE)

  return (
    <div className="relative w-full overflow-x-clip pb-24">
      <Rails>
        {/* Hero */}
        <section className="relative isolate pt-14 pb-10 text-center sm:pt-20">
          <div
            aria-hidden
            className="absolute inset-x-0 -top-32 -z-10 mx-auto h-[28rem] max-w-4xl bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand)_16%,transparent),transparent)]"
          />

          <div className="px-2 py-6">
            {fresh ? (
              <Link
                href={`/docs/${fresh.name}`}
                className="mo-enter soft-surface group inline-flex items-center gap-2 rounded-full py-1 pr-3 pl-1 text-sm transition-transform duration-150 ease-out active:scale-[0.97]"
              >
                <span className="rounded-full bg-brand px-2.5 py-0.5 text-xs font-semibold text-white">New</span>
                <span className="text-muted-foreground transition-colors group-hover:text-foreground">{fresh.title}</span>
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-3.5 text-muted-foreground" strokeWidth={2} />
              </Link>
            ) : (
              <Label className="mo-enter">
                {components.length} components · {skills.length} skills · MIT
              </Label>
            )}

            <h1 className="mx-auto mt-7 text-[clamp(2.125rem,7vw,5.25rem)] leading-[1.1] font-semibold tracking-[-0.055em]">
              <span className="mo-enter block" style={enter(60)}>
                Creative components,
              </span>
              <span className="mo-enter block whitespace-nowrap text-foreground/40" style={enter(120)}>
                <span className="text-foreground">one command</span> away.
              </span>
            </h1>
            <p
              className="mo-enter mx-auto mt-7 max-w-[34em] text-lg leading-relaxed text-pretty text-muted-foreground sm:text-xl"
              style={enter(180)}
            >
              React components and Claude skills by Krutik Raut, made with a designer’s eye. Install any of them into your
              project with the shadcn CLI.
            </p>

            <div className="mo-enter mt-9 flex flex-wrap items-center justify-center gap-4" style={enter(240)}>
              <PillLink href="/docs" variant="solid">
                Browse components
                <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
              </PillLink>
              <PillLink href={GITHUB_URL} external>
                <HugeiconsIcon icon={GithubIcon} className="size-4" strokeWidth={2} />
                Star on GitHub
              </PillLink>
            </div>
          </div>
        </section>

        {/* Stats */}
        <Band className="py-6 sm:py-8">
          <dl id="overview" className="grid scroll-mt-24 grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
            <Stat value={components.length} unit={components.length === 1 ? "component" : "components"} />
            <Stat value={skills.length} unit={skills.length === 1 ? "Claude skill" : "Claude skills"} />
            <Stat value={totalFiles} unit="files you own" />
            <Stat value="MIT" unit="license" />
          </dl>
        </Band>

        {/* Collection */}
        <Band>
          <BandHeader
            label="The collection"
            title="Pieces worth keeping."
            description="Each one a single file you can read, restyle and ship."
            action={<ArrowLink href="/docs">Browse all {items.length}</ArrowLink>}
          />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {showcase.map((item, i) => (
              <li key={item.name} className="mo-enter" style={enter(i * 50)}>
                <ItemCard item={item} />
              </li>
            ))}
          </ul>
        </Band>

        {/* Features */}
        <Band>
          <BandHeader
            label="Why creative-ui"
            title="Built like the rest of your stack."
            description="Nothing to learn and nothing to keep updated. It behaves like code you wrote yourself."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Tile key={f.title} className="p-6 sm:p-7">
                <span className="soft-well grid size-11 place-items-center rounded-2xl">
                  <HugeiconsIcon icon={f.icon} className="size-5 text-foreground" strokeWidth={1.75} />
                </span>
                <h3 className="mt-6 text-lg font-semibold tracking-[-0.02em]">{f.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed text-pretty text-muted-foreground">{f.body}</p>
              </Tile>
            ))}
          </div>
        </Band>

        {/* How it works */}
        <Band id="how-it-works">
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
                  <code className="soft-well block truncate rounded-xl px-3.5 py-2.5 font-mono text-xs">
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
        <Band id="installation">
          <BandHeader label="Installation" title="Two ways in." />
          <div className="mt-10 grid gap-4 sm:gap-5 lg:grid-cols-2">
            <Tile className="min-w-0 p-6 sm:p-7">
              <h3 className="text-lg font-semibold tracking-[-0.02em]">Install by name</h3>
              <p className="mt-1.5 mb-5 text-[15px] text-muted-foreground">
                <code className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-xs">{NAMESPACE}</code> is in the shadcn
                registry directory. Works in any project.
              </p>
              <InstallCommand target={installName(first?.name ?? "<name>")} />
            </Tile>
            <Tile className="min-w-0 p-6 sm:p-7">
              <h3 className="text-lg font-semibold tracking-[-0.02em]">Or install by URL</h3>
              <p className="mt-1.5 mb-5 text-[15px] text-muted-foreground">For older versions of the shadcn CLI.</p>
              <InstallCommand target={installUrl(first?.name ?? "<name>")} />
            </Tile>
          </div>
        </Band>

        {/* Sponsors: the shared band, set in this look's type by the tokens. */}
        <Band className="py-0 sm:py-0 [&>section]:border-t-0">
          <SponsorsBand />
        </Band>

        {/* Closing call to action */}
        <Band className="pb-0 sm:pb-0">
          <Tile className="relative isolate overflow-hidden rounded-[44px] px-6 py-20 text-center sm:py-28">
            <div
              aria-hidden
              className="absolute inset-x-0 -bottom-40 -z-10 mx-auto h-80 max-w-3xl bg-[radial-gradient(closest-side,color-mix(in_oklch,var(--brand)_18%,transparent),transparent)]"
            />
            <h2 className="mx-auto max-w-[16ch] text-4xl font-semibold tracking-[-0.05em] text-balance sm:text-6xl">
              Build something worth keeping.
            </h2>
            <p className="mx-auto mt-5 max-w-[46ch] text-lg leading-relaxed text-pretty text-muted-foreground">
              Free, open source and MIT licensed. Every item is plain JSON at{" "}
              <span className="font-mono text-[15px] text-foreground">/r/[name].json</span>.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <PillLink href="/docs" variant="solid">
                Get started
              </PillLink>
              <PillLink href="/r/registry.json" external>
                View registry.json
              </PillLink>
            </div>
          </Tile>
        </Band>
      </Rails>
    </div>
  )
}

/** A figure set like a reading on a widget: a bold value and a quiet unit. */
function Stat({ value, unit, className }: { value: string | number; unit: string; className?: string }) {
  return (
    <Tile className={cn("flex flex-col-reverse gap-1 px-6 py-6 sm:px-7 sm:py-7", className)}>
      <dt>
        <Quiet className="text-base">{unit}</Quiet>
      </dt>
      <dd className="text-5xl leading-none font-semibold tracking-[-0.05em] tabular-nums sm:text-6xl">
        <CountUp value={value} />
      </dd>
    </Tile>
  )
}

function ArrowLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="soft-surface group inline-flex h-10 items-center gap-1.5 rounded-full pr-3 pl-4 text-sm font-medium transition-transform duration-150 ease-out active:scale-[0.97]"
    >
      {children}
      <HugeiconsIcon
        icon={ArrowRight01Icon}
        className="size-4 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5"
        strokeWidth={2}
      />
    </Link>
  )
}
