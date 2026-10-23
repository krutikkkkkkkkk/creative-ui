import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, PlusSignIcon } from "@hugeicons/core-free-icons"

import { LAUNCH_OFFER, PLATFORM_SPONSORS, SPONSORS, SPONSOR_URL, TIERS, type Tier } from "@/lib/sponsors"
import { cn } from "@/lib/utils"
import { Eyebrow } from "@/components/home-primitives"

/* A gallery wall of sponsor plaques, hung as a pyramid: each tier is a centered row that
   widens toward the base. Empty slots are hung with a dashed frame. */

const SIZE: Record<Tier, string> = {
  diamond: "h-28 w-2/3",
  gold: "h-24 w-5/12",
  silver: "h-20 flex-1",
}

export function SponsorsBand() {
  const slots = TIERS.reduce((n, t) => n + t.slots, 0)
  const open = slots - Math.min(slots, SPONSORS.length)

  return (
    <section className="border-t py-20">
      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow>
            Sponsors · {open > 0 ? `${open} of ${slots} slots open` : "All slots taken"}
            {LAUNCH_OFFER && ` · ${LAUNCH_OFFER.percent}% off at launch`}
          </Eyebrow>
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

      <div className="flex flex-col gap-3">
        {TIERS.map(({ tier, label, slots }) => {
          const taken = SPONSORS.filter((s) => s.tier === tier)
          const empty = Math.max(0, slots - taken.length)
          return (
            <div key={tier} className="flex justify-center gap-3">
              {taken.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer sponsored"
                  className={cn(
                    "flex min-w-0 flex-col items-center justify-center gap-1 rounded-xl bg-muted/60 px-4 text-center transition-colors hover:bg-muted",
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
              ))}
              {Array.from({ length: empty }, (_, i) => (
                <a
                  key={i}
                  href={SPONSOR_URL}
                  className={cn(
                    "group flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground",
                    SIZE[tier]
                  )}
                >
                  <span className="flex items-center gap-1.5 text-sm">
                    <HugeiconsIcon icon={PlusSignIcon} className="size-3.5" strokeWidth={2} />
                    {tier === "diamond" ? "Your logo here" : "Your logo"}
                  </span>
                  <span className="font-mono text-[10px] tracking-[.08em] uppercase">{label}</span>
                </a>
              ))}
            </div>
          )
        })}
      </div>

      <PlatformSponsors />
    </section>
  )
}

/** Platform sponsors sit below the wall as a quiet logo strip, apart from the paid tiers. */
function PlatformSponsors() {
  return (
    <div className="mt-12 grid gap-4 border-t pt-8 sm:grid-cols-[180px_1fr] sm:items-center sm:gap-8">
      <p className="font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase">Platform sponsors</p>
      {PLATFORM_SPONSORS.length === 0 ? (
        <Link
          href="/sponsor/platform"
          className="group flex min-h-16 items-center justify-center rounded-xl border border-dashed px-4 py-3 text-center text-sm text-balance text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <span>
            <HugeiconsIcon icon={PlusSignIcon} className="mr-1.5 inline size-3.5 -translate-y-px" strokeWidth={2} />
            Offer credits, hosting or tools? Become a platform sponsor.
          </span>
        </Link>
      ) : (
        <ul className="flex flex-wrap items-center gap-x-10 gap-y-6">
          {PLATFORM_SPONSORS.map((p) => (
            <li key={p.name}>
              <a
                href={p.href}
                target="_blank"
                rel="noreferrer sponsored"
                className="flex flex-col items-start gap-1 opacity-70 grayscale transition-[opacity,filter] hover:opacity-100 hover:grayscale-0"
              >
                {p.logo ? (
                  <Image src={p.logo} alt={p.name} width={120} height={24} className="h-6 w-auto object-contain dark:invert" />
                ) : (
                  <span className="font-serif text-2xl leading-none">{p.name}</span>
                )}
                {p.provides && (
                  <span className="font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">
                    {p.provides}
                  </span>
                )}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
