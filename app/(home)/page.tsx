import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, GithubIcon } from "@hugeicons/core-free-icons"

import { GITHUB_URL, NAMESPACE, SITE_URL, getItem, getSummaries, readItemFile, skillIntro } from "@/lib/registry"
import { cn } from "@/lib/utils"
import { CodeBlock } from "@/components/code-block"
import { InstallCommand } from "@/components/copy-command"
import { ItemCard } from "@/components/item-card"
import { CollageFrame, CollageFrameOverlay } from "@/registry/new-york/blocks/collage-frame/collage-frame"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"

/* Home page in the Classical Collage art direction (warm variant): quiet UI, loud art,
   one metaphor per section, light serif statements and mono eyebrows. */

const GOLD = "#B8893A"

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
      {/* Hero: a hand sets the keystone. One piece, and the arch holds. */}
      <section className="relative isolate border-b bg-[#F4F2EE] dark:bg-transparent">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <GrainOverlay opacity={0.12} className="-z-10" />

        <div className="mx-auto grid w-full max-w-5xl items-center gap-14 px-4 pt-14 pb-20 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:pt-20 lg:pb-24">
          <div>
            <Eyebrow className="cc-rise">Open source · shadcn registry</Eyebrow>
            <h1 className="mt-6 font-serif text-[2.75rem] leading-[0.95] tracking-[-0.02em] sm:text-6xl lg:text-[4.25rem]">
              <span className="cc-rise block" style={delay(100)}>
                Timeless craft.
              </span>
              <span className="cc-rise block text-muted-foreground italic" style={delay(200)}>
                One command away.
              </span>
            </h1>
            <p
              className="cc-rise mt-7 max-w-[46ch] text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
              style={delay(300)}
            >
              React components and Claude skills by Krutik Raut, made with a designer’s eye. Install any of them
              into your project with the shadcn CLI.
            </p>
            <div className="cc-rise mt-9 flex flex-wrap gap-3" style={delay(400)}>
              {first && (
                <PillLink href="#collection" variant="solid">
                  <span className="size-1.5 rounded-full" style={{ backgroundColor: GOLD }} />
                  Browse the registry
                </PillLink>
              )}
              <PillLink href={GITHUB_URL} external>
                <HugeiconsIcon icon={GithubIcon} className="size-4" strokeWidth={2} />
                Star on GitHub
              </PillLink>
            </div>
          </div>

          <div className="cc-rise relative mx-auto w-full max-w-[340px] lg:mr-0" style={delay(250)}>
            <CollageFrame
              src="/art/arch-keystone.webp"
              alt="Oil painting of a hand placing a gold coin as the keystone of a stone arch"
              shape="arch"
              tilt={-1.5}
              className="aspect-[4/5] w-full"
            >
              <CollageFrameOverlay position="bottom-left" hang={28} tilt={1.5} className="cc-float">
                <Terminal name={first?.name} files={first?.fileCount} isSkill={first?.kind === "skill"} />
              </CollageFrameOverlay>
            </CollageFrame>
          </div>
        </div>
      </section>

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

        {/* Installation */}
        <section id="installation" className={cn("scroll-mt-20 py-20", featured && "border-t")}>
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

        {/* Closing call to action */}
        <section className="relative isolate overflow-hidden rounded-3xl bg-[#111214] px-6 py-16 text-white ring-1 ring-white/10 sm:px-12 sm:py-20">
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

function delay(ms: number) {
  return { "--cc-delay": `${ms}ms` } as React.CSSProperties
}

function Eyebrow({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase", className)}>
      {"// "}
      {children}
    </p>
  )
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-12">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.02em] sm:text-6xl">{title}</h2>
    </div>
  )
}

function PillLink({
  href,
  external,
  variant = "outline",
  children,
}: {
  href: string
  external?: boolean
  variant?: "solid" | "outline" | "light" | "ghost-dark"
  children: React.ReactNode
}) {
  const className = cn(
    "inline-flex h-11 items-center gap-2 rounded-full px-5 font-mono text-[11px] tracking-[.08em] uppercase transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
    variant === "solid" && "bg-foreground text-background hover:bg-foreground/85",
    variant === "outline" && "border bg-background/60 hover:bg-accent",
    variant === "light" && "bg-white text-[#111214] hover:bg-white/85",
    variant === "ghost-dark" && "border border-white/20 text-white hover:bg-white/10"
  )
  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {children}
      </a>
    )
  }
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

/** One focused dark widget floating on the painting. */
function Terminal({ name, files, isSkill }: { name?: string; files?: number; isSkill?: boolean }) {
  return (
    <div className="w-[min(300px,78vw)] rounded-xl bg-[#111214] p-4 text-white shadow-2xl ring-1 ring-white/10">
      <div className="flex items-center gap-1.5">
        <span className="size-2 rounded-full bg-white/20" />
        <span className="size-2 rounded-full bg-white/20" />
        <span className="size-2 rounded-full bg-white/20" />
        <span className="ml-auto font-mono text-[10px] tracking-[.08em] text-white/40 uppercase">terminal</span>
      </div>
      <pre className="mt-3 font-mono text-[11.5px] leading-relaxed whitespace-pre-wrap text-white/80">
        <span className="text-white/40">$ </span>npx shadcn add {NAMESPACE}/{name ?? "name"}
        {"\n"}
        <span style={{ color: GOLD }}>✓</span> Resolved registry item
        {"\n"}
        <span style={{ color: GOLD }}>✓</span> {files ?? 1} files written to {isSkill ? ".claude/skills/" : "components/"}
      </pre>
    </div>
  )
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col-reverse px-1">
      <dt className="mt-3 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">{label}</dt>
      <dd className="font-serif text-6xl leading-none tracking-[-0.02em] sm:text-7xl">{value}</dd>
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
