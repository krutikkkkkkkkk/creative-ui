import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiMagicIcon,
  ArrowRight01Icon,
  CommandLineIcon,
  GithubIcon,
  PuzzleIcon,
  Settings02Icon,
} from "@hugeicons/core-free-icons"

import { GITHUB_URL, NAMESPACE, SITE_URL, getSummaries } from "@/lib/registry"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CodeBlock } from "@/components/code-block"
import { InstallCommand } from "@/components/copy-command"
import { ItemCard } from "@/components/item-card"

export default async function Home() {
  const items = await getSummaries()
  const skills = items.filter((i) => i.kind === "skill")
  const components = items.filter((i) => i.kind === "component")
  const first = skills[0] ?? components[0]

  const registriesSnippet = `{
  "registries": {
    "${NAMESPACE}": "${SITE_URL}/r/{name}.json"
  }
}`

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-8">
      {/* Hero */}
      <section className="relative pt-14 pb-12 sm:pt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-10 -z-10 h-72"
          style={{
            background:
              "radial-gradient(ellipse at top left, color-mix(in oklch, var(--color-amber-500) 14%, transparent), transparent 60%)",
          }}
        />
        <Badge variant="outline" className="mb-6 gap-1.5 rounded-full px-3 py-1 font-normal">
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Open source · shadcn registry
        </Badge>
        <h1 className="max-w-3xl text-5xl leading-[1.05] tracking-tight text-balance sm:text-6xl">
          <span className="font-serif">Components &amp; skills,</span>{" "}
          <span className="font-serif text-muted-foreground italic">crafted with a designer’s eye.</span>
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-pretty text-muted-foreground">
          A growing collection of React components and Claude skills by Krutik Raut. Install any of
          them into your project with one shadcn command.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {first && (
            <Button size="lg" asChild>
              <Link href={`/items/${first.name}`}>
                Browse the registry
                <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} />
              </Link>
            </Button>
          )}
          <Button size="lg" variant="outline" asChild>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">
              <HugeiconsIcon icon={GithubIcon} strokeWidth={2} />
              Star on GitHub
            </a>
          </Button>
        </div>

        <dl className="mt-12 grid max-w-md grid-cols-3 divide-x rounded-xl border bg-card">
          <Stat label="Skills" value={skills.length} />
          <Stat label="Components" value={components.length} />
          <Stat label="License" value="MIT" />
        </dl>
      </section>

      {/* Installation */}
      <section id="installation" className="scroll-mt-20 border-t pt-12">
        <SectionTitle icon={CommandLineIcon} title="Installation" kicker="Two ways to install" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Step n={1} title="Install by URL" body="Works in any project. No setup needed.">
            <InstallCommand target={`${SITE_URL}/r/${first?.name ?? "<name>"}.json`} />
          </Step>
          <Step
            n={2}
            title="Or add the namespace"
            body={
              <>
                Add this to <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">components.json</code>,
                then install with <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">{NAMESPACE}/name</code>.
              </>
            }
          >
            <CodeBlock code={registriesSnippet} title="components.json" />
          </Step>
        </div>
      </section>

      {skills.length > 0 && (
        <section className="mt-16">
          <SectionTitle
            icon={AiMagicIcon}
            title="Claude skills"
            kicker="Install into .claude/skills/ and Claude Code picks them up"
          />
          <Grid>
            {skills.map((item) => (
              <ItemCard key={item.name} item={item} />
            ))}
          </Grid>
        </section>
      )}

      {components.length > 0 && (
        <section className="mt-16">
          <SectionTitle icon={PuzzleIcon} title="Components" kicker="Copy-in React + Tailwind code you own" />
          <Grid>
            {components.map((item) => (
              <ItemCard key={item.name} item={item} />
            ))}
          </Grid>
        </section>
      )}

      <section className="mt-16 flex flex-col items-start gap-4 rounded-2xl border bg-muted/30 p-6 sm:flex-row sm:items-center sm:p-8">
        <div className="grid size-11 shrink-0 place-items-center rounded-xl bg-background ring-1 ring-border">
          <HugeiconsIcon icon={Settings02Icon} className="size-5" strokeWidth={1.75} />
        </div>
        <div className="flex-1">
          <h3 className="font-medium">Using this with an AI coding tool?</h3>
          <p className="text-sm text-muted-foreground">
            Every item is plain JSON at <code className="font-mono text-xs">/r/[name].json</code>, so v0, Cursor
            and Claude Code can read the registry directly.
          </p>
        </div>
        <Button variant="outline" asChild>
          <a href="/r/registry.json" target="_blank" rel="noreferrer">
            View registry.json
          </a>
        </Button>
      </section>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-serif text-2xl">{value}</dd>
    </div>
  )
}

function SectionTitle({
  icon,
  title,
  kicker,
}: {
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  title: string
  kicker: string
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-4">
      <div>
        <div className="mb-2 flex items-center gap-2 text-muted-foreground">
          <HugeiconsIcon icon={icon} className="size-4" strokeWidth={2} />
          <span className="text-xs font-medium tracking-wider uppercase">{kicker}</span>
        </div>
        <h2 className="font-serif text-3xl tracking-tight">{title}</h2>
      </div>
    </div>
  )
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{children}</div>
}

function Step({
  n,
  title,
  body,
  children,
}: {
  n: number
  title: string
  body: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-start gap-3">
        <span className="grid size-6 shrink-0 place-items-center rounded-full border bg-background font-mono text-xs">
          {n}
        </span>
        <div>
          <h3 className="font-medium">{title}</h3>
          <p className="text-sm text-muted-foreground">{body}</p>
        </div>
      </div>
      {children}
    </div>
  )
}
