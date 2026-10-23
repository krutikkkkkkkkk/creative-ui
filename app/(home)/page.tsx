import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, GithubIcon } from "@hugeicons/core-free-icons"

import { GITHUB_URL, NAMESPACE, SITE_URL, getItem, getSummaries, readItemFile, skillIntro } from "@/lib/registry"
import { cn } from "@/lib/utils"
import { CodeBlock } from "@/components/code-block"
import { InstallCommand } from "@/components/copy-command"
import { ItemCard } from "@/components/item-card"
import { Hero } from "@/components/hero/hero"
import { LiveTerminal } from "@/components/hero/live-terminal"
import { CollectionCarousel } from "@/components/home/collection-carousel"
import { CountUp } from "@/components/home/count-up"
import { Manifesto } from "@/components/home/manifesto"
import { SponsorsBand } from "@/components/home/sponsors-band"
import { StackSteps } from "@/components/home/stack-steps"
import { Eyebrow, PillLink } from "@/components/home-primitives"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"

/* Home page in the Classical Collage art direction (warm variant): quiet UI, loud art,
   one metaphor per section, light serif statements and mono eyebrows. */

export default async function Home() {
  const items = await getSummaries()
  const skills = items.filter((i) => i.kind === "skill")
  const components = items.filter((i) => i.kind === "component")
  const first = skills[0] ?? components[0]
  const featured = skills[0] ? await getFeaturedSkill(skills[0].name) : null
  const totalFiles = items.reduce((n, i) => n + i.fileCount, 0)

  const registriesSnippet = `{
  "registries": {
    "${NAMESPACE}": "${SITE_URL}/r/{name}.json"
  }
}`

  return (
    <div className="relative w-full overflow-x-clip">
      <Hero items={items} />

      <div className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-8">
        {/* Stats */}
        <dl className="grid grid-cols-2 gap-y-10 border-b py-14 sm:grid-cols-4">
          <Stat value={skills.length} label={skills.length === 1 ? "Claude skill" : "Claude skills"} />
          <Stat value={components.length} label={components.length === 1 ? "Component" : "Components"} />
          <Stat value={totalFiles} label="Files you own" />
          <Stat value="MIT" label="License" />
        </dl>

        {/* Featured skill: a figure at work on a laptop. Claude, working in your taste. */}
        {featured && (
          <section className="grid items-center gap-10 py-20 lg:grid-cols-2 lg:gap-14">
            <Link
              href={`/docs/${featured.name}`}
              className="group relative isolate block aspect-[4/5] overflow-hidden rounded-2xl ring-1 ring-border"
            >
              <Image
                src="/art/scholar-laptop.webp"
                alt="Neoclassical painting of a woman in a white gown typing on a halftone laptop"
                fill
                sizes="(min-width: 1024px) 460px, 100vw"
                className="-z-10 object-cover transition-transform duration-1200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
              />
              <GrainOverlay opacity={0.18} />
              <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 to-transparent" />
              <p className="absolute top-5 left-5 font-mono text-[11px] tracking-[.08em] text-white/80 uppercase">
                {"// "}Featured skill
              </p>
              <p className="absolute bottom-6 left-6 max-w-[14ch] font-serif text-4xl leading-[1] tracking-[-0.02em] text-white">
                Old Masters × modern tech.
              </p>
            </Link>

            <div className="min-w-0">
              <Eyebrow>Claude skill · {featured.fileCount} files</Eyebrow>
              <h2 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.02em] text-balance sm:text-6xl">
                Teach Claude your taste.
              </h2>
              <p className="mt-6 max-w-[52ch] leading-relaxed text-pretty text-muted-foreground">
                <span className="text-foreground">{featured.title}.</span> {featured.intro}
              </p>
              <InstallCommand target={`${SITE_URL}/r/${featured.name}.json`} className="mt-8" />
              <Link
                href={`/docs/${featured.name}`}
                className="group mt-6 inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
              >
                Read the skill
                <HugeiconsIcon
                  icon={ArrowRight01Icon}
                  className="size-4 transition-transform group-hover:translate-x-0.5"
                  strokeWidth={2}
                />
              </Link>
            </div>
          </section>
        )}

        {/* How it works: three moves, stacked like prints laid on a table. */}
        <section id="how-it-works" className={cn("scroll-mt-20 py-20", featured && "border-t")}>
          <SectionHeading eyebrow="How it works" title="Three moves." />
          <StackSteps
            steps={[
              {
                n: "01",
                title: "Pick a piece.",
                body: "Browse the collection. Every component and skill is one plain JSON file at /r/name.json, so v0, Cursor and Claude Code can read it as easily as you can.",
                art: { src: "/art/sorting-prints.webp", alt: "Oil painting of a woman sorting a fan of small prints on a wooden desk" },
              },
              {
                n: "02",
                title: "Run one command.",
                body: "The shadcn CLI resolves the item and writes its files straight into your project. No package to install, nothing to configure, nothing to keep updated.",
                art: { src: "/art/scholar-laptop.webp", alt: "Neoclassical painting of a woman in a white gown typing on a halftone laptop" },
                widget: first ? (
                  <LiveTerminal
                    items={[{ name: first.name, files: first.fileCount, kind: first.kind }]}
                    namespace={NAMESPACE}
                    className="rotate-[-1.5deg]"
                  />
                ) : undefined,
              },
              {
                n: "03",
                title: "Own the marble.",
                body: "What lands in your repo is plain React and Tailwind. Rename it, restyle it, delete half of it. There is no runtime dependency on this site.",
                art: { src: "/art/sculptor-chisel.webp", alt: "Oil painting of a sculptor's hands with chisel and mallet at a marble face emerging from stone" },
              },
            ]}
          />
        </section>

        {/* In motion: the DNA carousel with the collection's artworks. */}
        <section className="border-t py-20">
          <SectionHeading eyebrow="In motion" title="The collection, in motion." />
          <CollectionCarousel />
        </section>
      </div>

      <Manifesto />

      <div className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-8">
        {/* Installation */}
        <section id="installation" className="scroll-mt-20 py-20">
          <SectionHeading eyebrow="Installation" title="Two ways in." />
          <div className="grid gap-10 lg:grid-cols-2">
            <Step n="01" title="Install by URL" body="Works in any project. No setup needed.">
              <InstallCommand target={`${SITE_URL}/r/${first?.name ?? "<name>"}.json`} />
            </Step>
            <Step
              n="02"
              title="Or add the namespace"
              body={
                <>
                  Add this to <Code>components.json</Code>, then install with <Code>{NAMESPACE}/name</Code>.
                </>
              }
            >
              <CodeBlock code={registriesSnippet} title="components.json" />
            </Step>
          </div>
        </section>

        {/* Collection */}
        <section id="collection" className="scroll-mt-20 border-t py-20">
          <SectionHeading eyebrow="The collection" title="Everything in the registry." />
          {skills.length > 0 && (
            <Group label="Claude skills" note="Install into .claude/skills/ and Claude Code picks them up">
              {skills.map((item) => (
                <ItemCard key={item.name} item={item} />
              ))}
            </Group>
          )}
          {components.length > 0 && (
            <Group label="Components" note="Copy-in React and Tailwind code you own">
              {components.map((item) => (
                <ItemCard key={item.name} item={item} />
              ))}
            </Group>
          )}
        </section>

        <SponsorsBand />

        {/* Closing call to action */}
        <section className="relative isolate mt-4 overflow-hidden rounded-3xl bg-[#111214] px-6 py-16 text-white ring-1 ring-white/10 sm:px-12 sm:py-20">
          <DataTexture />
          <GrainOverlay opacity={0.25} />
          <Eyebrow className="text-white/60">Built in the open</Eyebrow>
          <h2 className="mt-5 max-w-[16ch] font-serif text-5xl leading-[0.95] tracking-[-0.02em] text-balance sm:text-6xl">
            Build something worth keeping.
          </h2>
          <p className="mt-6 max-w-[52ch] leading-relaxed text-pretty text-white/65">
            Every item is plain JSON at <span className="font-mono text-[13px] text-white/85">/r/[name].json</span>, so
            v0, Cursor and Claude Code can read the registry directly.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <PillLink href={GITHUB_URL} external variant="light">
              <HugeiconsIcon icon={GithubIcon} className="size-4" strokeWidth={2} />
              Star on GitHub
            </PillLink>
            <PillLink href="/r/registry.json" external variant="ghost-dark">
              View registry.json
            </PillLink>
          </div>
        </section>
      </div>
    </div>
  )
}

async function getFeaturedSkill(name: string) {
  const item = await getItem(name)
  if (!item) return null
  const skillPath = item.files?.find((f) => f.path.endsWith("/SKILL.md"))?.path
  const skillMd = skillPath ? await readItemFile(skillPath) : null
  const summary = (await getSummaries()).find((s) => s.name === name)!
  return { ...summary, intro: (skillMd && skillIntro(skillMd)) || summary.description }
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-12">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.02em] sm:text-6xl">{title}</h2>
    </div>
  )
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col-reverse px-1">
      <dt className="mt-3 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">{label}</dt>
      <dd className="font-serif text-6xl leading-none tracking-[-0.02em] sm:text-7xl">
        <CountUp value={value} />
      </dd>
    </div>
  )
}

function Step({ n, title, body, children }: { n: string; title: string; body: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div>
        <p className="font-mono text-[11px] tracking-[.08em] text-muted-foreground">{n} —</p>
        <h3 className="mt-2 font-serif text-3xl tracking-[-0.01em]">{title}</h3>
        <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
      </div>
      {children}
    </div>
  )
}

function Group({ label, note, children }: { label: string; note: string; children: React.ReactNode }) {
  return (
    <div className="mt-12 first:mt-0">
      <div className="mb-5 flex flex-wrap items-baseline justify-between gap-2 border-b pb-3">
        <h3 className="font-serif text-2xl">{label}</h3>
        <p className="font-mono text-[11px] text-muted-foreground">{note}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{children}</code>
}

const TEXTURE_TOKENS = [
  "GET /r/registry.json 200",
  "REGISTRY:ITEM",
  "SHADCN BUILD OK",
  "FILES_WRITTEN 26",
  "TARGET ~/.claude/skills",
  "NAMESPACE @creative-ui",
  "SCHEMA registry-item.json",
  "LICENSE MIT",
  "DEPENDENCIES 0",
  "CACHE HIT",
  "STATUS COMPLETE",
  "TYPE registry:component",
]

/** Faint monospace system text behind the closing panel (Aureon signature). */
function DataTexture() {
  let seed = 42
  const rand = () => (seed = (seed * 9301 + 49297) % 233280) / 233280
  const lines = Array.from({ length: 28 }, () =>
    Array.from(
      { length: 7 },
      () => TEXTURE_TOKENS[Math.floor(rand() * TEXTURE_TOKENS.length)] + " ".repeat(3 + Math.floor(rand() * 6))
    ).join("")
  )
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden font-mono text-[11px] leading-6 whitespace-pre text-white opacity-[0.07] select-none [mask-image:linear-gradient(to_left,black,transparent_85%)]"
    >
      {lines.join("\n")}
    </div>
  )
}
