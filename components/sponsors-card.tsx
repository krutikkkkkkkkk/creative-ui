import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, PlusSignIcon, UserIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

export const SPONSOR_URL = "https://github.com/sponsors/krutikkkkkkkkk"

type Tier = "diamond" | "silver"

type Sponsor = {
  name: string
  href: string
  tier: Tier
  /** Path under /public. Falls back to the name when omitted. */
  logo?: string
  tagline?: string
}

/* Add sponsors here. Empty tiers show a "your logo here" slot. */
const SPONSORS: Sponsor[] = []

/* Reach shown to prospective sponsors. Update from your analytics. */
const VISITORS = { count: 12400, label: "monthly visitors" }

const AVATAR_TINTS = [
  "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  "bg-rose-500/15 text-rose-600 dark:text-rose-400",
]

const TIERS: { tier: Tier; label: string; slots: number }[] = [
  { tier: "diamond", label: "Diamond", slots: 1 },
  { tier: "silver", label: "Silver", slots: 2 },
]

export function SponsorsCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card p-3 text-card-foreground", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-semibold tracking-tight">Sponsors</h2>
        <span className="font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">
          Open source
        </span>
      </div>

      <Visitors />

      {TIERS.map(({ tier, label, slots }) => {
        const sponsors = SPONSORS.filter((s) => s.tier === tier)
        const empty = Math.max(0, slots - sponsors.length)
        return (
          <div key={tier} className="mt-3">
            <p className="mb-1.5 text-xs text-muted-foreground">{label}</p>
            <div className={cn("grid gap-1.5", tier === "silver" && "grid-cols-2")}>
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

      <a
        href={SPONSOR_URL}
        target="_blank"
        rel="noreferrer"
        className="group mt-3 flex items-center justify-between rounded-md px-1 py-1 text-xs font-medium text-amber-600 hover:text-amber-500 dark:text-amber-400 dark:hover:text-amber-300"
      >
        Become a sponsor
        <HugeiconsIcon
          icon={ArrowRight01Icon}
          className="size-3.5 transition-transform group-hover:translate-x-0.5"
          strokeWidth={2}
        />
      </a>
    </div>
  )
}

function Visitors() {
  const count = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(
    VISITORS.count
  )
  return (
    <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-muted/60 px-2.5 py-2">
      <div className="flex -space-x-1.5" aria-hidden>
        {AVATAR_TINTS.map((tint) => (
          <span
            key={tint}
            className={cn("grid size-6 place-items-center rounded-full ring-2 ring-card", tint)}
          >
            <HugeiconsIcon icon={UserIcon} className="size-3.5" strokeWidth={2} />
          </span>
        ))}
      </div>
      <p className="min-w-0 truncate text-xs leading-tight text-muted-foreground">
        <span className="font-mono text-sm font-semibold text-foreground tabular-nums">{count}+</span>{" "}
        {VISITORS.label}
      </p>
    </div>
  )
}

function SponsorTile({ sponsor }: { sponsor: Sponsor }) {
  const diamond = sponsor.tier === "diamond"
  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noreferrer sponsored"
      title={sponsor.name}
      className={cn(
        "flex flex-col items-center justify-center gap-0.5 rounded-lg bg-muted/60 px-2 text-center transition-colors hover:bg-muted",
        diamond ? "h-16" : "h-11"
      )}
    >
      {sponsor.logo ? (
        <Image
          src={sponsor.logo}
          alt={sponsor.name}
          width={diamond ? 160 : 96}
          height={diamond ? 28 : 20}
          className={cn("w-auto object-contain dark:invert", diamond ? "h-7" : "h-5")}
        />
      ) : (
        <span className={cn("truncate font-semibold tracking-tight", diamond ? "text-sm" : "text-xs")}>
          {sponsor.name}
        </span>
      )}
      {diamond && sponsor.tagline && (
        <span className="truncate text-[11px] text-muted-foreground">{sponsor.tagline}</span>
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
        tier === "diamond" ? "h-16" : "h-11"
      )}
    >
      <HugeiconsIcon icon={PlusSignIcon} className="size-3" strokeWidth={2} />
      {tier === "diamond" ? "Your logo here" : "Your logo"}
    </a>
  )
}
