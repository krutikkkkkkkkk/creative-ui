import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { AiMagicIcon, ArrowRight01Icon, PuzzleIcon } from "@hugeicons/core-free-icons"

import type { ItemSummary } from "@/lib/registry"
import { cn } from "@/lib/utils"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ItemCard({ item }: { item: ItemSummary }) {
  const isSkill = item.kind === "skill"

  return (
    <Link href={`/items/${item.name}`} className="group block h-full rounded-xl focus-visible:outline-none">
      <Card
        className={cn(
          "h-full gap-4 overflow-hidden py-5 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:-translate-y-0.5 group-hover:border-foreground/20 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring",
          item.banner && "pt-0"
        )}
      >
        {item.banner && (
          <div className="relative aspect-video overflow-hidden border-b">
            <Image
              src={item.banner}
              alt=""
              fill
              sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-1200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
            />
          </div>
        )}
        <CardHeader className="gap-3 px-5">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">
              <span
                className={cn(
                  "grid size-6 place-items-center rounded-md ring-1",
                  isSkill
                    ? "bg-[#B8893A]/10 text-[#B8893A] ring-[#B8893A]/25"
                    : "bg-foreground/5 text-foreground/70 ring-border"
                )}
              >
                <HugeiconsIcon icon={isSkill ? AiMagicIcon : PuzzleIcon} className="size-3.5" strokeWidth={2} />
              </span>
              {isSkill ? "Claude skill" : "Component"} · {item.fileCount} {item.fileCount === 1 ? "file" : "files"}
            </span>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
              strokeWidth={2}
            />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="font-serif text-2xl leading-tight font-normal tracking-[-0.01em]">
              {item.title}
            </CardTitle>
            <CardDescription className="line-clamp-3 leading-relaxed">{item.description}</CardDescription>
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}
