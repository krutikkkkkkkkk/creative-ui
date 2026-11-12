"use client"

import * as React from "react"
import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { CommandLine } from "@/components/home/sheet"

/* The whole registry as a catalogue index: one ruled line per item. On wide screens a viewing
   frame beside the list shows whichever line is under the pointer, with what it does and its
   command. Every line is a link, so nothing here depends on hover. */

export type IndexEntry = {
  name: string
  title: string
  kind: "component" | "skill"
  fileCount: number
  poster: string | null
  isNew: boolean
  blurb: string
  command: string
}

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]"

export function ItemIndex({ entries }: { entries: IndexEntry[] }) {
  const [active, setActive] = React.useState(() => Math.max(0, entries.findIndex((e) => e.kind === "component")))
  const current = entries[active]
  const groups = [
    { label: "Claude skills", kind: "skill" as const },
    { label: "Components", kind: "component" as const },
  ]

  return (
    <div className="grid gap-x-12 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-7">
        {groups.map((group) => {
          const rows = entries.map((e, i) => ({ e, i })).filter(({ e }) => e.kind === group.kind)
          if (!rows.length) return null
          return (
            <div key={group.kind} className="mb-10 last:mb-0">
              <p className="pb-3 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">
                {group.label} · {rows.length}
              </p>
              <ol className="border-t">
                {rows.map(({ e, i }) => (
                  <li key={e.name} className="border-b">
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
                          "min-w-0 flex-1 font-serif text-2xl text-balance sm:truncate leading-tight tracking-[-0.015em] transition-[translate,color] duration-300 sm:text-[1.75rem]",
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
        <div className="sticky top-24">
          <div className="relative aspect-[16/10] overflow-hidden bg-paper ring-1 ring-border dark:bg-muted/40">
            {entries.map((e, i) =>
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
          <p className="mt-4 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">
            No. {String(active + 1).padStart(2, "0")} · {current.kind === "skill" ? "Claude skill" : "Component"} ·{" "}
            {current.fileCount} {current.fileCount === 1 ? "file" : "files"}
          </p>
          {/* Fixed height, so the command under it stays put while the text changes. */}
          <p className="mt-2 line-clamp-4 h-[6.5em] text-sm leading-relaxed text-pretty text-muted-foreground">
            <span className="text-foreground">{current.title}.</span> {current.blurb}
          </p>
          <CommandLine command={current.command} className="mt-3" />
        </div>
      </div>
    </div>
  )
}
