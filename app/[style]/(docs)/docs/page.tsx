import type { Metadata } from "next"

import Link from "next/link"

import { getSummaries, installName } from "@/lib/registry"
import { COLLECTIONS, isLiveUiStyle, otherStyle, styleOf, type StyleParams } from "@/lib/ui-style"
import { pageMetadata } from "@/lib/seo"
import { InstallCommand } from "@/components/copy-command"
import { Code, DocFrame, Note, PageHeader, Section } from "@/components/docs-prose"
import { ItemGrid } from "@/components/item-card"

export const metadata: Metadata = pageMetadata({
  title: "Introduction",
  description: "How to install creative-ui components and Claude skills with the shadcn CLI.",
  path: "/docs",
})

/* The Get started pages, in the order a new project needs them. */
const GET_STARTED = [
  { href: "/docs/installation/next", title: "Install Next.js", body: "Create an app with the App Router and TypeScript." },
  { href: "/docs/installation/tailwind", title: "Install Tailwind CSS", body: "Add Tailwind CSS v4 with the PostCSS plugin." },
  { href: "/docs/installation/utilities", title: "Add utilities", body: "Add the cn() class helper every component imports." },
  { href: "/docs/installation/cli", title: "CLI", body: "Initialise shadcn, then install items by name." },
] as const

export default async function DocsPage({ params }: { params: StyleParams }) {
  const style = await styleOf(params)
  const other = otherStyle(style)
  const [items, otherItems] = await Promise.all([getSummaries(style), getSummaries(other)])
  const skills = items.filter((i) => i.kind === "skill")
  const components = items.filter((i) => i.kind === "component")
  const first = skills[0] ?? components[0]
  // Pieces listed in the other look only, so this page can point at them once that look is live.
  const elsewhere = isLiveUiStyle(other) ? otherItems.filter((i) => i.look === other).length : 0

  return (
    <DocFrame>
      <PageHeader
        title="Introduction"
        description="creative-ui is a shadcn registry of React components and Claude skills. Nothing is installed as a package: the shadcn CLI copies the source into your project, so you own every file and can change it freely."
      />

      <Section id="installation" title="Installation">
        <Note className="mb-4">
          Already have a Next.js project with Tailwind and shadcn? Add any item by name. No extra config.
        </Note>
        <InstallCommand target={installName(first?.name ?? "<name>")} />

        <Note className="mt-10 mb-4">Starting from scratch? Follow the Get started pages in order.</Note>
        <div className="@container">
          <ol className="grid gap-3 @lg:grid-cols-2 @4xl:grid-cols-4">
            {GET_STARTED.map((step, i) => (
              <li key={step.href} className="min-w-0">
                <Link
                  href={step.href}
                  className="flex h-full flex-col gap-1 rounded-xl border px-4 py-3.5 transition-[border-color,background-color] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:bg-muted/40"
                >
                  <span className="font-mono text-[10px] tracking-[.08em] text-muted-foreground tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-sm font-medium">{step.title}</span>
                  <span className="text-[13px] leading-relaxed text-pretty text-muted-foreground">{step.body}</span>
                </Link>
              </li>
            ))}
          </ol>
        </div>
        <Note className="mt-4">
          Components land in <Code>components/</Code>. Skills land in <Code>.claude/skills/</Code>, where Claude Code
          picks them up automatically.
        </Note>
      </Section>

      {skills.length > 0 && (
        <Section title="Claude skills" aside={`${skills.length}`}>
          <ItemGrid items={skills} columns={2} />
        </Section>
      )}

      {components.length > 0 && (
        <Section id="components" title="Components" aside={`${components.length}`}>
          <ItemGrid items={components} />
        </Section>
      )}

      {elsewhere > 0 && (
        <Section title={`${COLLECTIONS[other].label} collection`} aside={`${elsewhere}`}>
          <Note>
            creative-ui has a second collection of {COLLECTIONS[other].blurb}.{" "}
            <a href={`?style=${other}`} className="font-medium text-foreground underline underline-offset-4">
              Switch to the {other} look
            </a>{" "}
            to browse {elsewhere === 1 ? "it" : `all ${elsewhere}`}.
          </Note>
        </Section>
      )}
    </DocFrame>
  )
}
