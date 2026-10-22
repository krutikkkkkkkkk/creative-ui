import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { AiMagicIcon, ArrowRight01Icon, PuzzleIcon } from "@hugeicons/core-free-icons"

import type { ItemSummary } from "@/lib/registry"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ItemCard({ item }: { item: ItemSummary }) {
  const isSkill = item.kind === "skill"

  return (
    <Link href={`/items/${item.name}`} className="group block h-full rounded-xl focus-visible:outline-none">
      <Card className="h-full gap-4 py-5 transition-all group-hover:-translate-y-0.5 group-hover:border-foreground/20 group-hover:shadow-md group-focus-visible:ring-2 group-focus-visible:ring-ring">
        <CardHeader className="gap-3 px-5">
          <div className="flex items-start justify-between">
            <div
              className={
                isSkill
                  ? "grid size-10 place-items-center rounded-lg bg-amber-500/10 text-amber-600 ring-1 ring-amber-500/20 dark:text-amber-400"
                  : "grid size-10 place-items-center rounded-lg bg-sky-500/10 text-sky-600 ring-1 ring-sky-500/20 dark:text-sky-400"
              }
            >
              <HugeiconsIcon icon={isSkill ? AiMagicIcon : PuzzleIcon} className="size-5" strokeWidth={1.75} />
            </div>
            <HugeiconsIcon
              icon={ArrowRight01Icon}
              className="size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
              strokeWidth={2}
            />
          </div>
          <div className="space-y-1.5">
            <CardTitle className="text-base">{item.title}</CardTitle>
            <CardDescription className="line-clamp-3 leading-relaxed">{item.description}</CardDescription>
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            <Badge variant="secondary" className="font-normal">
              {isSkill ? "Claude skill" : "Component"}
            </Badge>
            <Badge variant="outline" className="font-mono font-normal text-muted-foreground">
              {item.fileCount} {item.fileCount === 1 ? "file" : "files"}
            </Badge>
          </div>
        </CardHeader>
      </Card>
    </Link>
  )
}
