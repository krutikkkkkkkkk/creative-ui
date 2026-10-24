import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { AiMagicIcon, ArrowRight01Icon, PuzzleIcon } from "@hugeicons/core-free-icons"

import type { ItemSummary } from "@/lib/registry"
import { cn } from "@/lib/utils"

/* A piece hung on the gallery wall: the work inset in a thin mount, the title on a label beneath. */

const EASE = "ease-[cubic-bezier(0.22,1,0.36,1)]"

export function ItemCard({ item }: { item: ItemSummary }) {
  const isSkill = item.kind === "skill"

  return (
    <Link
      href={`/docs/${item.name}`}
      className={cn(
        "group flex flex-col gap-1 rounded-2xl border bg-card p-1.5 transition-colors duration-300 hover:border-foreground/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        EASE
      )}
    >
      <div className="relative aspect-video overflow-hidden rounded-[10px] bg-[#F4F2EE] ring-1 ring-border/70 dark:bg-muted/40">
        {item.poster ? (
          <Image
            src={item.poster}
            alt=""
            fill
            sizes="(min-width: 1024px) 360px, (min-width: 640px) 50vw, 100vw"
            className={cn("object-cover transition-transform duration-700 group-hover:scale-[1.03]", EASE)}
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px]">
            <HugeiconsIcon icon={isSkill ? AiMagicIcon : PuzzleIcon} className="size-6 text-muted-foreground" strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3 px-3.5 py-3">
        <h3 className="font-serif text-xl leading-tight tracking-[-0.01em] sm:text-2xl">{item.title}</h3>
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          className={cn(
            "size-4 shrink-0 -translate-x-1 text-muted-foreground opacity-0 transition-[opacity,translate] duration-300 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100",
            EASE
          )}
          strokeWidth={2}
        />
      </div>
    </Link>
  )
}
