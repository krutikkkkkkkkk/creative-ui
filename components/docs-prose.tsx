import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { OnThisPage, type TocItem } from "@/components/on-this-page"
import { SponsorsCard } from "@/components/sponsors-card"

/* Shared building blocks for every docs page.

   The grid: one centred frame, a content column and a 15rem rail from xl up. Everything in the
   content column starts on the same left edge; prose pages cap their measure, item pages and
   the index use the full column.

   The rhythm: 56px above the title, 56-64px between sections, 24px from a section's rule to its
   content, 12-16px between blocks inside a section. */

type SectionProps = {
  id?: string
  title: string
  aside?: string
  className?: string
  children: React.ReactNode
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

/* The rail's table of contents is read off the page's own <Section>s, so the two cannot drift.
   Only sections passed as direct children (or inside fragments) are listed. */
function collectToc(children: React.ReactNode, out: TocItem[] = []) {
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return
    if (child.type === React.Fragment) {
      collectToc((child.props as { children?: React.ReactNode }).children, out)
    } else if (child.type === Section) {
      const { id, title } = child.props as SectionProps
      out.push({ id: id ?? slugify(title), title })
    }
  })
  return out
}

/** The page grid: content column, plus the rail (contents and sponsors) on wide screens. */
export function DocFrame({ measure = "wide", children }: { measure?: "wide" | "prose"; children: React.ReactNode }) {
  const toc = collectToc(children)

  return (
    <div className="mx-auto grid w-full max-w-[84rem] flex-1 grid-cols-1 gap-x-10 px-5 sm:px-8 xl:grid-cols-[minmax(0,1fr)_15rem] xl:px-10 2xl:gap-x-12">
      <article className={cn("min-w-0 pt-10 pb-20 sm:pt-14 sm:pb-24", measure === "prose" && "max-w-3xl")}>
        {children}
      </article>
      <aside className="hidden xl:block">
        {/* Sits level with the page title, then sticks 32px under the header. */}
        <div className="no-scrollbar sticky top-[5.5rem] mt-14 flex max-h-[calc(100svh-7rem)] flex-col gap-8 overflow-y-auto pb-4">
          {toc.length > 1 && <OnThisPage items={toc} />}
          <SponsorsCard />
        </div>
      </aside>
    </div>
  )
}

/** Title block at the top of a page: optional eyebrow, the title, a lead and a row of actions. */
export function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow?: React.ReactNode
  title: string
  description?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <header className="flex flex-col gap-5">
      {eyebrow}
      <h1 className="font-serif text-4xl tracking-tight text-balance sm:text-5xl">{title}</h1>
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground">{description}</p>
      )}
      {children}
    </header>
  )
}

/** A prose page (Get started): the frame at reading width with a title block. */
export function DocPage({
  title,
  description,
  children,
}: {
  title: string
  description: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <DocFrame measure="prose">
      <PageHeader title={title} description={description} />
      {children}
    </DocFrame>
  )
}

export function Section({ id, title, aside, className, children }: SectionProps) {
  return (
    <section id={id ?? slugify(title)} className={cn("mt-14 scroll-mt-24 sm:mt-16", className)}>
      <div className="mb-6 flex items-baseline justify-between gap-4 border-b pb-3">
        <h2 className="font-serif text-2xl tracking-tight">{title}</h2>
        {aside && <span className="shrink-0 font-mono text-xs text-muted-foreground tabular-nums">{aside}</span>}
      </div>
      {children}
    </section>
  )
}

/** A numbered sequence. Each step's marker sits in a fixed gutter, joined to the next by a rule. */
export function Steps({ children }: { children: React.ReactNode }) {
  return <ol className="flex flex-col">{children}</ol>
}

export function Step({
  n,
  title,
  body,
  children,
}: {
  n: string
  title: string
  body?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <li className="group/step grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-4 sm:gap-x-5">
      <div className="flex flex-col items-center" aria-hidden>
        <span className="grid size-7 shrink-0 place-items-center rounded-full border font-mono text-xs text-muted-foreground tabular-nums">
          {n}
        </span>
        <span className="my-2 w-px flex-1 bg-border group-last/step:hidden" />
      </div>
      <div className="flex min-w-0 flex-col gap-3 pb-10 group-last/step:pb-0">
        <div>
          <h3 className="leading-7 font-medium">
            <span className="sr-only">Step {n}: </span>
            {title}
          </h3>
          {body && <p className="mt-1 text-sm leading-relaxed text-pretty text-muted-foreground">{body}</p>}
        </div>
        {children}
      </div>
    </li>
  )
}

export function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{children}</code>
}

/** A paragraph of supporting text, held to a readable measure on wide pages. */
export function Note({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("max-w-3xl text-sm leading-relaxed text-pretty text-muted-foreground", className)}>{children}</p>
  )
}

type PagerLink = { href: string; label: string }

/** Previous / next links at the bottom of a page. */
export function Pager({ prev, next }: { prev?: PagerLink; next?: PagerLink }) {
  return (
    <nav aria-label="Previous and next page" className="mt-16 grid grid-cols-2 gap-3 border-t pt-8 sm:mt-20 sm:gap-4">
      {prev ? <PagerTile {...prev} dir="prev" /> : <span />}
      {next && <PagerTile {...next} dir="next" />}
    </nav>
  )
}

function PagerTile({ href, label, dir }: PagerLink & { dir: "prev" | "next" }) {
  const isNext = dir === "next"
  return (
    <Link
      href={href}
      className={cn(
        "group flex min-w-0 flex-col gap-1.5 rounded-xl border px-4 py-3.5 transition-[border-color,background-color] duration-150 outline-none focus-visible:ring-2 focus-visible:ring-ring [@media(hover:hover)]:hover:border-foreground/20 [@media(hover:hover)]:hover:bg-muted/40",
        isNext && "items-end text-right"
      )}
    >
      <span className="font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">
        {isNext ? "Next" : "Previous"}
      </span>
      <span className="flex max-w-full items-center gap-1.5 text-sm font-medium">
        {!isNext && <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} />}
        <span className="truncate">{label}</span>
        {isNext && <HugeiconsIcon icon={ArrowRight01Icon} className="size-4 shrink-0 text-muted-foreground" strokeWidth={2} />}
      </span>
    </Link>
  )
}
