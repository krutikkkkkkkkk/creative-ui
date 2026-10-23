import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"

import { SPONSORS, SPONSOR_URL, TIERS, type Tier } from "@/lib/sponsors"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/home-primitives"

/* A gallery wall of sponsor plaques. Empty slots are hung with a dashed frame. */

const SIZE: Record<Tier, string> = {
  diamond: "h-28 sm:col-span-2",
  gold: "h-24",
  silver: "h-20",
}

export function SponsorsBand() {
  const slots = TIERS.reduce((n, t) => n + t.slots, 0)
  const open = slots - Math.min(slots, SPONSORS.length)

  return (
    <section className="border-t py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>Sponsors · {open > 0 ? `${open} of ${slots} slots open` : "All slots taken"}</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl leading-[0.95] tracking-[-0.02em] sm:text-5xl">On the wall.</h2>
        </div>
        <Link
          href="/sponsor"
          className="group inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
        >
          Become a sponsor
          <HugeiconsIcon
            icon={ArrowRight01Icon}
            className="size-4 transition-transform group-hover:translate-x-0.5"
            strokeWidth={2}
          />
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {TIERS.flatMap(({ tier, label, slots }) => {
          const taken = SPONSORS.filter((s) => s.tier === tier)
          const empty = Math.max(0, slots - taken.length)
          return [
            ...taken.map((s) => (
              <a
                key={s.name}
                href={s.href}
                target="_blank"
                rel="noreferrer sponsored"
                className={cn(
                  "flex flex-col items-center justify-center gap-1 rounded-xl bg-muted/60 px-4 transition-colors hover:bg-muted",
                  SIZE[tier]
                )}
              >
                {s.logo ? (
                  <Image src={s.logo} alt={s.name} width={160} height={32} className="h-8 w-auto object-contain dark:invert" />
                ) : (
                  <span className="font-serif text-2xl">{s.name}</span>
                )}
                {s.offer && <span className="text-xs text-balance text-muted-foreground">{s.offer}</span>}
              </a>
            )),
            ...Array.from({ length: empty }, (_, i) => (
              <a
                key={`${tier}-${i}`}
                href={SPONSOR_URL}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "group flex flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground",
                  SIZE[tier]
                )}
              >
                <span className="flex items-center gap-1.5 text-sm">
                  <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" strokeWidth={2} />
                  Your logo here
                </span>
                <span className="font-mono text-[10px] tracking-[.08em] uppercase">{label}</span>
              </a>
            )),
          ]
        })}
      </div>
    </section>
  )
}
