import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { AiMagicIcon, ArrowRight01Icon, PuzzleIcon } from "@hugeicons/core-free-icons"

import type { ItemSummary } from "@/lib/registry"
import { cn } from "@/lib/utils"

/* A piece hung on the gallery wall: the work on a tinted stage, a label beneath with what it is,
   its name and one line on what it does. One card for both looks; modern: variants carry the
   differences. Posters are captured on white, so in light mode they multiply onto the stage
   and only the artwork shows. */

const EASE = "ease-[cubic-bezier(0.23,1,0.32,1)]"

export function ItemCard({ item, className }: { item: ItemSummary; className?: string }) {
  const isSkill = item.kind === "skill"
  const meta = [isSkill ? "Claude skill" : "Component", `${item.fileCount} ${item.fileCount === 1 ? "file" : "files"}`]

  return (
    <Link
      href={`/docs/${item.name}`}
      className={cn(
        "group flex h-full flex-col rounded-2xl border bg-card p-1.5 transition-[border-color,box-shadow,scale] duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.99]",
        "[@media(hover:hover)]:hover:border-foreground/20 modern:rounded-xl modern:[@media(hover:hover)]:hover:shadow-[0_10px_30px_-14px_rgb(0_0_0/0.18)]",
        EASE,
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] bg-paper ring-1 ring-border/60 modern:rounded-lg modern:bg-muted dark:bg-muted/40">
        {item.poster ? (
          <Image
            src={item.poster}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className={cn(
              "object-cover mix-blend-multiply transition-transform duration-700 dark:mix-blend-normal dark:brightness-[0.88] [@media(hover:hover)]:group-hover:scale-[1.03]",
              EASE
            )}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]">
            <HugeiconsIcon icon={isSkill ? AiMagicIcon : PuzzleIcon} className="size-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
        )}
        {item.isNew && (
          <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2 py-0.5 text-[11px] font-medium shadow-xs ring-1 ring-border/60 backdrop-blur">
            <span className="size-1.5 rounded-full bg-brand" />
            New
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-3.5 pt-3.5 pb-3 modern:px-3 modern:pt-3">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase modern:text-[11px] modern:tracking-normal modern:normal-case">
            {meta.join(" · ")}
          </p>
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className={cn(
              "size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-[opacity,translate] duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
              EASE
            )}
            strokeWidth={2}
          />
        </div>
        <h3 className="mt-1 text-[15px] leading-snug font-semibold tracking-[-0.01em] classic:mt-1.5 classic:font-serif classic:text-2xl classic:leading-tight classic:font-normal">
          {item.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-pretty text-muted-foreground">{item.description}</p>
      </div>
    </Link>
  )
}
