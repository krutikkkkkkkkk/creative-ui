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

export function ItemCard({
  item,
  className,
  sizes = "(min-width: 1536px) 320px, (min-width: 640px) 50vw, 100vw",
}: {
  item: ItemSummary
  className?: string
  /** Width hint for the poster; pass one when the card sits in a wider or narrower column. */
  sizes?: string
}) {
  const isSkill = item.kind === "skill"
  const meta = [isSkill ? "Claude skill" : "Component", `${item.fileCount} ${item.fileCount === 1 ? "file" : "files"}`]

  return (
    <Link
      href={`/docs/${item.name}`}
      className={cn(
        "group flex h-full flex-col rounded-2xl border bg-card p-1.5 transition-[border-color,box-shadow,scale] duration-200 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.99]",
        "[@media(hover:hover)]:hover:border-foreground/20",
        "modern:soft-surface modern:rounded-[28px] modern:border-0 modern:p-2 modern:transition-[scale,translate] modern:[@media(hover:hover)]:hover:-translate-y-0.5",
        EASE,
        className
      )}
    >
      <div className="relative aspect-[16/10] overflow-hidden rounded-[10px] bg-paper ring-1 ring-border/60 modern:soft-well modern:rounded-[20px] modern:ring-0 dark:bg-muted/40">
        {item.poster ? (
          <Image
            src={item.poster}
            alt=""
            fill
            sizes={sizes}
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

      <div className="flex flex-1 flex-col px-3.5 pt-3.5 pb-3 modern:px-4 modern:pt-4 modern:pb-3.5">
        <div className="flex items-center justify-between gap-3">
          <p className="font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase modern:font-sans modern:text-[11px] modern:font-semibold modern:tracking-[0.06em] modern:text-muted-foreground/75">
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
        <h3 className="mt-1 text-[15px] leading-snug font-semibold tracking-[-0.01em] modern:mt-1.5 modern:text-lg modern:tracking-[-0.02em] classic:mt-1.5 classic:font-serif classic:text-2xl classic:leading-tight classic:font-normal">
          {item.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-pretty text-muted-foreground">{item.description}</p>
      </div>
    </Link>
  )
}

/* The wall the cards hang on. Columns follow the width of the wall itself, not the viewport, so
   the grid holds whether the sidebar is open or closed: one column, two from 36rem, and three
   from 56rem when `columns` is 3. */
export function ItemGrid({ items, columns = 3 }: { items: ItemSummary[]; columns?: 2 | 3 }) {
  return (
    <div className="@container">
      <ul className={cn("grid gap-5 @xl:grid-cols-2", columns === 3 && "@4xl:grid-cols-3")}>
        {items.map((item) => (
          <li key={item.name} className="min-w-0">
            <ItemCard
              item={item}
              sizes={columns === 2 ? "(min-width: 1280px) 480px, (min-width: 640px) 50vw, 100vw" : undefined}
            />
          </li>
        ))}
      </ul>
    </div>
  )
}
