import type { Metadata } from "next"

import { getSummaries, installUrl, NAMESPACE, SITE_URL } from "@/lib/registry"
import { CodeBlock } from "@/components/code-block"
import { InstallCommand } from "@/components/copy-command"
import { ItemCard } from "@/components/item-card"

export const metadata: Metadata = {
  title: "Introduction",
  description: "How to install creative-ui components and Claude skills with the shadcn CLI.",
}

export default async function DocsPage() {
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
    <div className="mx-auto w-full max-w-4xl px-4 pt-10 pb-24 sm:px-8">
      <div className="flex flex-col gap-4">
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">Introduction</h1>
        <p className="max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground">
          creative-ui is a shadcn registry of React components and Claude skills. Nothing is installed as a package:
          the shadcn CLI copies the source into your project, so you own every file and can change it freely.
        </p>
      </div>

      <Section id="installation" title="Installation">
        <div className="flex flex-col gap-8">
          <Step n="1" title="Install by URL" body="Works in any project that has shadcn set up. No extra config.">
            <InstallCommand target={installUrl(first?.name ?? "<name>")} />
          </Step>
          <Step
            n="2"
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
        <p className="mt-6 text-sm text-muted-foreground">
          Components land in <Code>components/</Code>. Skills land in <Code>.claude/skills/</Code>, where Claude Code
          picks them up automatically.
        </p>
      </Section>

      {skills.length > 0 && (
        <Section title="Claude skills" aside={`${skills.length}`}>
          <div className="grid gap-4 sm:grid-cols-2">
            {skills.map((item) => (
              <ItemCard key={item.name} item={item} />
            ))}
          </div>
        </Section>
      )}

      {components.length > 0 && (
        <Section title="Components" aside={`${components.length}`}>
          <div className="grid gap-4 sm:grid-cols-2">
            {components.map((item) => (
              <ItemCard key={item.name} item={item} />
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

function Section({
  id,
  title,
  aside,
  children,
}: {
  id?: string
  title: string
  aside?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-20">
      <div className="mb-4 flex items-baseline justify-between border-b pb-2">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {aside && <span className="font-mono text-xs text-muted-foreground">{aside}</span>}
      </div>
      {children}
    </section>
  )
}

function Step({ n, title, body, children }: { n: string; title: string; body: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div>
        <h3 className="font-medium">
          <span className="mr-2 font-mono text-xs text-muted-foreground">{n}.</span>
          {title}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{body}</p>
      </div>
      {children}
    </div>
  )
}

function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{children}</code>
}
