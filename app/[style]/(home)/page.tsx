import type { Metadata } from "next"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, GithubIcon } from "@hugeicons/core-free-icons"

import {
  COMPANY_NAME,
  COMPANY_URL,
  GITHUB_URL,
  NAMESPACE,
  getItem,
  getSummaries,
  installName,
  installUrl,
  type ItemSummary,
  readItemFile,
  skillIntro,
} from "@/lib/registry"
import { AUTHOR, SITE_NAME, SITE_TAGLINE, pageMetadata, siteJsonLd } from "@/lib/seo"
import { TESTIMONIALS } from "@/lib/testimonials"
import { styleOf, type StyleParams, type UiStyle } from "@/lib/ui-style"
import { InstallCommand } from "@/components/copy-command"
import { JsonLd } from "@/components/json-ld"
import { Hero } from "@/components/hero/hero"
import { CollectionCarousel } from "@/components/home/collection-carousel"
import { Endpaper } from "@/components/home/endpaper"
import { FileTear } from "@/components/home/file-tear"
import { ItemIndex, type IndexEntry } from "@/components/home/item-index"
import { CommandLine, Lead, PlateMarks, SectionHead } from "@/components/home/sheet"
import { SponsorsBand } from "@/components/home/sponsors-band"
import { SHARE_URL, Testimonials } from "@/components/home/testimonials"
import { PillLink } from "@/components/home-primitives"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"

/* Home page: one proof sheet for both looks. Every picture on it is rendered live by a registry
   component and labelled with that component's name, sections open with a running head and a
   full sentence, and nothing is shown that isn't real (no counters, no empty testimonial wall).
   The structure is written once. Classic sets it in serif with ruled lines and printer's marks;
   modern sets the same sections in sans on raised soft tiles, through `modern:` variants. */

export const metadata: Metadata = pageMetadata({ title: { absolute: `${SITE_NAME}: ${SITE_TAGLINE}` }, path: "/" })

export default async function Home({ params }: { params: StyleParams }) {
  const style = await styleOf(params)
  // The home page presents the whole registry, both collections, whichever look it is read in.
  const items = await getSummaries()
  return <HomeSheet items={items} style={style} />
}

/** The component whose source sits under the paper in the install section. */
const UNWRAPPED = "halftone-image"

/* Four rules from the Classical Collage skill, which is also this site's art direction. */
const HOUSE_RULES = [
  "Loud art, quiet interface.",
  "One metaphor per section, and it has to be literal.",
  "A light serif, tight leading, one accent.",
  "Code you own, not code you rent.",
]

/* Classic keeps the type in a narrow column and lets plates run wider. Modern lines both up
   with its header pill (max-w-6xl plus the gutter). */
const TEXT = "mx-auto w-full px-4 classic:max-w-5xl classic:sm:px-8 modern:max-w-[74rem]"
const PLATE = "mx-auto w-full px-4 classic:max-w-[1280px] classic:sm:px-8 modern:max-w-[74rem]"
const ARROW_LINK =
  "group inline-flex items-center gap-1 font-mono text-[11px] tracking-[.08em] uppercase underline-offset-4 hover:underline"
const INLINE_LINK =
  "underline decoration-foreground/25 underline-offset-[0.18em] transition-colors hover:decoration-foreground"

async function HomeSheet({ items, style }: { items: ItemSummary[]; style: UiStyle }) {
  const modern = style === "modern"
  const command = (name: string) => `npx shadcn@latest add ${installName(name)}`
  const skills = await Promise.all(items.filter((i) => i.kind === "skill").map((s) => getSkill(s)))
  const intros = new Map(skills.map((s) => [s.name, s.intro]))
  const entries: IndexEntry[] = items.map((i) => ({
    name: i.name,
    title: i.title,
    kind: i.kind,
    look: i.look,
    fileCount: i.fileCount,
    poster: i.poster,
    isNew: i.isNew,
    blurb: intros.get(i.name) ?? i.description,
    command: command(i.name),
  }))
  const first = items.find((i) => i.kind === "component") ?? items[0]
  const source = await getSource(UNWRAPPED)

  return (
    <div className="sheet relative w-full overflow-x-clip">
      <JsonLd data={siteJsonLd()} />
      <Hero items={items} style={style} />

      {/* 01. The whole registry, one line each. */}
      <section id="index" className={`${TEXT} scroll-mt-20 py-16 sm:py-24`}>
        <SectionHead n="01" title="Index" meta={`${items.length} entries`} />
        <div className="pt-10">
          <ItemIndex entries={entries} style={style} />
        </div>
      </section>

      {/* 02. Install: tear the wrapper and the thing inside is a source file. */}
      <section id="installation" className={`${TEXT} scroll-mt-20 pb-16 sm:pb-24`}>
        <SectionHead n="02" title="Install" meta="shadcn CLI · nothing to keep updated" />
        <div className="grid gap-x-12 gap-y-14 pt-10 lg:grid-cols-12">
          <div className="flex min-w-0 justify-center lg:sticky lg:top-24 lg:col-span-5 lg:justify-start lg:self-start">
            {source && <FileTear name={UNWRAPPED} file={`components/${UNWRAPPED}.tsx`} {...source} />}
          </div>
          <div className="min-w-0 lg:col-span-7">
            <Lead>
              There is no package. The CLI writes the source into your project, and from then on it is your code
              to rename, restyle or cut in half.
            </Lead>
            <dl className="mt-10 border-t modern:grid modern:gap-4 modern:border-t-0">
              <Way term="By name">
                <p>
                  <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs text-foreground">{NAMESPACE}</code> is
                  in the shadcn registry directory, so this works in any project with no setup.
                </p>
                <InstallCommand target={installName(first?.name ?? "<name>")} className="mt-4" />
              </Way>
              <Way term="By URL">
                <p>For older versions of the shadcn CLI that don&rsquo;t know the namespace.</p>
                <InstallCommand target={installUrl(first?.name ?? "<name>")} className="mt-4" />
              </Way>
              <Way term="For agents">
                <p>
                  Every item is plain JSON at{" "}
                  <span className="font-mono text-[13px] text-foreground">/r/[name].json</span>, so v0, Cursor and
                  Claude Code can read the registry directly.
                </p>
                <p className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
                  <a href="/r/registry.json" target="_blank" rel="noreferrer" className={ARROW_LINK}>
                    registry.json <Arrow />
                  </a>
                  <Link href="/docs/installation/mcp" className={ARROW_LINK}>
                    MCP setup <Arrow />
                  </Link>
                </p>
              </Way>
            </dl>
          </div>
        </div>
      </section>

      {/* 03. The DNA carousel, wider than the text like the hero plate. */}
      <section className="pb-16 sm:pb-24">
        <div className={TEXT}>
          <SectionHead n="03" title="In motion" meta="Plate 3 · dna-carousel" />
        </div>
        <div className={`${PLATE} pt-12`}>
          <div className="relative modern:soft-surface modern:overflow-hidden modern:rounded-[32px] modern:py-8">
            <PlateMarks />
            <CollectionCarousel />
          </div>
        </div>
      </section>

      {/* 04. Claude skills. */}
      {skills.length > 0 && (
        <section className={`${TEXT} pb-16 sm:pb-24`}>
          <SectionHead n="04" title="Claude skills" meta="Installs to .claude/skills" />
          <Lead className="max-w-[26em] pt-10">
            A skill is a folder of instructions Claude Code reads before it starts.{" "}
            <span className="text-muted-foreground">
              {skills.length === 1 ? "This one hands" : "These hand"} it a way of working, the same way a component
              hands you a file.
            </span>
          </Lead>

          <div className="mt-12 grid md:grid-cols-2 classic:border-t modern:gap-5">
            {skills.map((s, i) => (
              <article
                key={s.name}
                className="flex min-w-0 flex-col classic:border-b classic:py-8 classic:md:odd:border-r classic:md:odd:pr-10 classic:md:even:pl-10 modern:soft-surface modern:rounded-[28px] modern:p-7"
              >
                <p className="font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">
                  Skill {String(i + 1).padStart(2, "0")} · {s.fileCount} files
                </p>
                <h3 className="mt-3 font-serif text-3xl leading-[1.05] tracking-[-0.02em] text-balance">{s.title}</h3>
                <p className="mt-4 line-clamp-5 leading-relaxed text-pretty text-muted-foreground">{s.intro}</p>
                <ul className="mt-6 mb-8 font-mono text-[11px] leading-6 text-muted-foreground">
                  {s.files.map((f) => (
                    <li key={f} className="truncate">
                      <span className="mr-2 text-foreground/30 select-none">├</span>
                      {f}
                    </li>
                  ))}
                  {s.more > 0 && (
                    <li>
                      <span className="mr-2 text-foreground/30 select-none">└</span>
                      and {s.more} more
                    </li>
                  )}
                </ul>
                <CommandLine command={command(s.name)} className="mt-auto" />
                <Link href={`/docs/${s.name}`} className={`${ARROW_LINK} mt-4 self-start`}>
                  Read the skill <Arrow />
                </Link>
              </article>
            ))}
          </div>

          <div className="grid gap-x-12 gap-y-6 pt-10 lg:grid-cols-12">
            <p className="font-mono text-[10px] leading-relaxed tracking-[.08em] text-muted-foreground uppercase lg:col-span-3">
              Four rules from the first one{!modern && ", which this page follows"}
            </p>
            <ol className="grid gap-x-10 gap-y-6 sm:grid-cols-2 lg:col-span-9">
              {HOUSE_RULES.map((rule, i) => (
                <li key={rule} className="flex gap-4">
                  <span className="pt-1.5 font-mono text-[11px] text-muted-foreground">0{i + 1}</span>
                  <p className="text-2xl leading-[1.12] tracking-[-0.015em] text-balance classic:font-serif modern:font-medium modern:tracking-[-0.035em]">
                    {rule.split(" ").map((word, j) => (
                      <span key={j} className="cc-word">
                        {word}{" "}
                      </span>
                    ))}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <div className={TEXT}>
        <SponsorsBand n="05" className="pb-16 sm:pb-24" />
        {TESTIMONIALS.length > 0 && <Testimonials />}
      </div>

      {/* Colophon, on the back endpaper. */}
      <section className="relative isolate border-t bg-paper modern:border-t-0 modern:px-4 modern:pb-20">
        <GrainOverlay opacity={0.14} className="-z-10 modern:hidden" />
        {/* The back page: a ruled band of paper in classic, one large raised tile in modern. */}
        <div className="mx-auto grid w-full items-end gap-x-12 gap-y-12 lg:grid-cols-12 classic:max-w-5xl classic:px-4 classic:py-16 classic:sm:px-8 classic:sm:py-24 modern:soft-surface modern:max-w-6xl modern:rounded-[40px] modern:p-7 modern:sm:p-12">
          <div className="min-w-0 lg:col-span-7">
            <h2 className="font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase">Colophon</h2>
            <Lead className="mt-5">
              {SITE_NAME} is made by{" "}
              <a href={AUTHOR.url} target="_blank" rel="noreferrer" className={INLINE_LINK}>
                {AUTHOR.name}
              </a>{" "}
              at{" "}
              <a href={COMPANY_URL} target="_blank" rel="noreferrer" className={INLINE_LINK}>
                {COMPANY_NAME}
              </a>
              .
            </Lead>
            <p className="mt-6 max-w-[34em] leading-relaxed text-pretty text-muted-foreground">
              Set in {modern ? "Geist and Geist Mono" : "Geist Serif, Geist and Geist Mono"}. Built with Next.js,
              Tailwind CSS and the shadcn registry.
              The plates on this page are rendered in your browser by the components in the index, and the
              paintings under them are public-domain works and original generated pieces.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <PillLink href={GITHUB_URL} external variant="solid">
                <HugeiconsIcon icon={GithubIcon} className="size-4" strokeWidth={2} />
                Star on GitHub
              </PillLink>
              {TESTIMONIALS.length === 0 && (
                <PillLink href={SHARE_URL} external>
                  Shipped with it? Tell me on X
                </PillLink>
              )}
            </div>
          </div>
          <figure className="min-w-0 lg:col-span-5">
            <Endpaper command={command("wax-seal")} />
            <figcaption className="mt-4 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">
              Plate 4 · wax-seal on marbled-paper · drag to comb the ink
            </figcaption>
          </figure>
        </div>
      </section>
    </div>
  )
}

/** A skill's summary, the opening of its SKILL.md and the first few files it installs. */
async function getSkill(summary: ItemSummary) {
  const item = await getItem(summary.name)
  const paths = item?.files?.map((f) => f.path) ?? []
  const skillPath = paths.find((p) => p.endsWith("/SKILL.md"))
  const skillMd = skillPath ? await readItemFile(skillPath) : null
  // Paths as they read inside the skill's own folder, SKILL.md first.
  const root = skillPath ? skillPath.slice(0, -"SKILL.md".length) : ""
  const local = paths.map((p) => (p.startsWith(root) ? p.slice(root.length) : p))
  const ordered = [...local.filter((p) => p === "SKILL.md"), ...local.filter((p) => p !== "SKILL.md")]
  const shown = ordered.slice(0, 5)
  return {
    ...summary,
    intro: plain((skillMd && skillIntro(skillMd)) || summary.description),
    files: shown,
    more: ordered.length - shown.length,
  }
}

/** Markdown emphasis out, and a paragraph that led into a list ends as a sentence. */
function plain(markdown: string) {
  return markdown.replace(/[*_`]/g, "").replace(/:$/, ".")
}

/** The opening lines of a component's source, as the CLI writes it. */
async function getSource(name: string) {
  const item = await getItem(name)
  const path = item?.files?.[0]?.path
  const text = path ? await readItemFile(path) : null
  if (!text) return null
  const all = text.replace(/\r\n/g, "\n").trimEnd().split("\n")
  return { lines: all.slice(0, 30), totalLines: all.length }
}

function Way({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-x-8 gap-y-2 sm:grid-cols-[7rem_1fr] classic:border-b classic:py-6 modern:soft-surface modern:rounded-[24px] modern:p-6">
      <dt className="pt-0.5 font-mono text-[11px] tracking-[.08em] uppercase">{term}</dt>
      <dd className="min-w-0 text-sm leading-relaxed text-muted-foreground">{children}</dd>
    </div>
  )
}

function Arrow() {
  return (
    <HugeiconsIcon
      icon={ArrowRight01Icon}
      className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
      strokeWidth={2}
    />
  )
}
