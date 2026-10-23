import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"

import { SPONSORS, SPONSOR_URL, TIERS, type Sponsor, type Tier } from "@/lib/sponsors"
import { cn } from "@/lib/utils"
import { Card } from "@/components/ui/card"

/* Tile sizes per tier, largest first. */
const TILE: Record<Tier, { height: string; logo: { width: number; height: number; className: string }; text: string }> = {
  diamond: { height: "min-h-16 py-2.5", logo: { width: 160, height: 28, className: "h-7" }, text: "text-sm" },
  gold: { height: "h-14", logo: { width: 128, height: 24, className: "h-6" }, text: "text-sm" },
  silver: { height: "h-11", logo: { width: 96, height: 20, className: "h-5" }, text: "text-xs" },
}

export function SponsorsCard({ className }: { className?: string }) {
  return (
    <Card className={cn("gap-0 p-3 shadow-none", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight">Sponsors</h2>
        <span className="font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">
          Open source
        </span>
      </div>

      {TIERS.map(({ tier, label, slots }) => {
        const sponsors = SPONSORS.filter((s) => s.tier === tier)
        const empty = Math.max(0, slots - sponsors.length)
        return (
          <div key={tier} className="mt-3">
            <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
            <div className={cn("grid gap-1.5", slots > 1 && "grid-cols-2")}>
              {sponsors.map((s) => (
                <SponsorTile key={s.name} sponsor={s} />
              ))}
              {Array.from({ length: empty }, (_, i) => (
                <EmptyTile key={i} tier={tier} />
              ))}
            </div>
          </div>
        )
      })}

      <Link
        href="/sponsor"
        className="group mt-3 flex items-center justify-between rounded-md px-1 py-1 text-xs font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
      >
        Become a sponsor
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          strokeWidth={2}
        />
      </Link>
    </Card>
  )
}

function SponsorTile({ sponsor }: { sponsor: Sponsor }) {
  const tile = TILE[sponsor.tier]
  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noreferrer sponsored"
      title={sponsor.offer ? `${sponsor.name}: ${sponsor.offer}` : sponsor.name}
      className={cn(
        "flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg bg-muted/60 px-2 text-center transition-colors hover:bg-muted",
        tile.height
      )}
    >
      {sponsor.logo ? (
        <Image
          src={sponsor.logo}
          alt={sponsor.name}
          width={tile.logo.width}
          height={tile.logo.height}
          className={cn("w-auto object-contain dark:invert", tile.logo.className)}
        />
      ) : (
        <span className={cn("truncate font-semibold tracking-tight", tile.text)}>{sponsor.name}</span>
      )}
      {/* The offer wraps to two lines; the full text is in the title tooltip. */}
      {sponsor.tier === "diamond" && sponsor.offer && (
        <span className="line-clamp-2 w-full text-[11px] leading-snug text-balance text-muted-foreground">
          {sponsor.offer}
        </span>
      )}
    </a>
  )
}

function EmptyTile({ tier }: { tier: Tier }) {
  return (
    <a
      href={SPONSOR_URL}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "flex items-center justify-center gap-1.5 rounded-lg border border-dashed text-[11px] text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground",
        TILE[tier].height
      )}
    >
      <HugeiconsIcon icon={PlusSignIcon} className="size-3" strokeWidth={2} />
      {tier === "diamond" ? "Your logo here" : "Your logo"}
    </a>
  )
}
