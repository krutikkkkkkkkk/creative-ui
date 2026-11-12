"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { COLLECTIONS, otherStyle, type UiStyle } from "@/lib/ui-style"
import { cn } from "@/lib/utils"
import { CommandLine } from "@/components/home/sheet"

/* The whole registry as a catalogue index: one ruled line per item, in three lists: the Claude
   skills, then the two collections with the current look's own first. On wide screens a viewing
   frame beside the list shows whichever line is under the pointer, with what it does and its
   command. Every line is a link, so nothing here depends on hover. */

export type IndexEntry = {
  name: string
  title: string
  kind: "component" | "skill"
  /** The collection a component belongs to, or null when it is shared by both. */
  look: UiStyle | null
  fileCount: number
  poster: string | null
  isNew: boolean
  blurb: string
  command: string
}

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]"

export function ItemIndex({ entries, style }: { entries: IndexEntry[]; style: UiStyle }) {
  const other = otherStyle(style)
  // A component with no collection is listed with the classical ones, where the first pieces began.
  const inLook = (e: IndexEntry, look: UiStyle) => e.kind === "component" && (e.look ?? "classic") === look
  const groups = [
    { key: "skills", label: "Claude skills", rows: entries.filter((e) => e.kind === "skill") },
    { key: style, label: `${COLLECTIONS[style].label} collection`, rows: entries.filter((e) => inLook(e, style)) },
    { key: other, label: `${COLLECTIONS[other].label} collection`, rows: entries.filter((e) => inLook(e, other)) },
  ].filter((g) => g.rows.length > 0)
  // Numbered in the order they are listed, so the numbers run down the page.
  const order = groups.flatMap((g) => g.rows)
  const [active, setActive] = React.useState(() => Math.max(0, order.findIndex((e) => e.kind === "component")))
  const current = order[active]

  return (
    <div className="grid gap-x-12 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-7">
        {groups.map((group) => {
          const rows = group.rows.map((e) => ({ e, i: order.indexOf(e) }))
          return (
            <div key={group.key} className="mb-10 last:mb-0">
              <p className="pb-3 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">
                {group.label} · {rows.length}
              </p>
              <ol className="border-t modern:soft-surface modern:rounded-[28px] modern:border-t-0 modern:px-5 modern:py-1.5">
                {rows.map(({ e, i }) => (
                  <li key={e.name} className="border-b modern:last:border-b-0">
                    <Link
                      href={`/docs/${e.name}`}
                      onPointerEnter={(ev) => ev.pointerType !== "touch" && setActive(i)}
                      onFocus={() => setActive(i)}
                      className="group flex items-baseline gap-4 py-3 outline-none sm:gap-6"
                    >
                      <span className="w-6 shrink-0 font-mono text-[11px] text-muted-foreground tabular-nums">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={cn(
                          "min-w-0 flex-1 text-2xl text-balance sm:truncate classic:font-serif modern:font-medium modern:tracking-[-0.035em] leading-tight tracking-[-0.015em] transition-[translate,color] duration-300 sm:text-[1.75rem]",
                          EASE,
                          "group-focus-visible:underline group-focus-visible:underline-offset-4",
                          "lg:text-foreground/55 lg:group-hover:text-foreground",
                          active === i && "lg:translate-x-2 lg:text-foreground"
                        )}
                      >
                        {e.title}
                        {e.isNew && (
                          <span className="ml-2.5 inline-block size-1.5 -translate-y-2 rounded-full bg-brand" title="New" />
                        )}
                      </span>
                      <span className="shrink-0 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase max-sm:hidden">
                        {e.fileCount} {e.fileCount === 1 ? "file" : "files"}
                      </span>
                      <HugeiconsIcon
                        icon={ArrowRight01Icon}
                        className={cn(
                          "size-4 shrink-0 self-center text-muted-foreground transition-[opacity,translate] duration-200 lg:-translate-x-1 lg:opacity-0",
                          EASE,
                          active === i && "lg:translate-x-0 lg:opacity-100"
                        )}
                        strokeWidth={2}
                      />
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )
        })}
      </div>

      {/* Viewing frame. Hidden below lg, where the list stands on its own. */}
      <div className="max-lg:hidden lg:col-span-5">
        <div className="sticky top-24 modern:soft-surface modern:rounded-[28px] modern:p-3 modern:pb-4">
          <div className="relative aspect-[16/10] overflow-hidden bg-paper ring-1 ring-border dark:bg-muted/40 modern:soft-well modern:rounded-[20px] modern:ring-0">
            {order.map((e, i) =>
              e.poster ? (
                <Image
                  key={e.name}
                  src={e.poster}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 420px, 1px"
                  className={cn(
                    "object-cover mix-blend-multiply transition-opacity duration-300 dark:mix-blend-normal dark:brightness-[0.88]",
                    active === i ? "opacity-100" : "opacity-0"
                  )}
                />
              ) : null
            )}
          </div>
          <p className="mt-4 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase modern:px-2.5">
            No. {String(active + 1).padStart(2, "0")} · {current.kind === "skill" ? "Claude skill" : "Component"} ·{" "}
            {current.fileCount} {current.fileCount === 1 ? "file" : "files"}
          </p>
          {/* Fixed height, so the command under it stays put while the text changes. */}
          <p className="mt-2 line-clamp-4 h-[6.5em] text-sm leading-relaxed text-pretty text-muted-foreground modern:px-2.5">
            <span className="text-foreground">{current.title}.</span> {current.blurb}
          </p>
          <CommandLine command={current.command} className="mt-3 modern:mx-1" />
        </div>
      </div>
    </div>
  )
}
