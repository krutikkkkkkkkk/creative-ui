import type { Metadata } from "next"

import Link from "next/link"

import { getSummaries, installName } from "@/lib/registry"
import { InstallCommand } from "@/components/copy-command"
import { Code, Section } from "@/components/docs-prose"
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
        <p className="mb-4 text-sm text-muted-foreground">
          Already have a Next.js project with Tailwind and shadcn? Add any item by name. No extra config.
        </p>
        <InstallCommand target={installName(first?.name ?? "<name>")} />
        <p className="mt-6 text-sm text-muted-foreground">
          Starting from scratch? Follow the Get started pages in order:{" "}
          <Link href="/docs/installation/next" className="font-medium text-foreground underline underline-offset-4">
            Install Next.js
          </Link>
          ,{" "}
          <Link href="/docs/installation/tailwind" className="font-medium text-foreground underline underline-offset-4">
            Install Tailwind CSS
          </Link>
          ,{" "}
          <Link href="/docs/installation/utilities" className="font-medium text-foreground underline underline-offset-4">
            Add utilities
          </Link>{" "}
          and{" "}
          <Link href="/docs/installation/cli" className="font-medium text-foreground underline underline-offset-4">
            CLI
          </Link>
          . Components land in <Code>components/</Code>. Skills land in <Code>.claude/skills/</Code>, where Claude Code
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
        <Section id="components" title="Components" aside={`${components.length}`}>
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
