import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, CheckmarkCircle02Icon, FavouriteIcon, PlusSignIcon } from "@hugeicons/core-free-icons"

import { getSummaries } from "@/lib/registry"
import { SPONSORS, SPONSOR_URL, TIERS, type Sponsor, type Tier } from "@/lib/sponsors"
import { cn } from "@/lib/utils"
import { getVisitorCount } from "@/lib/visitors"
import { Card } from "@/components/ui/card"
import { Eyebrow, GOLD, PillLink, delay } from "@/components/home-primitives"
import { CollageFrame, CollageFrameOverlay } from "@/registry/new-york/blocks/collage-frame/collage-frame"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"

/* Sponsor page in the same Classical Collage direction as home. The metaphor: a gallery
   wall with a gilt frame waiting for its plaque. */

export const metadata: Metadata = {
  title: "Sponsor",
  description: "Sponsor creative-ui and put your logo in front of the developers who install it.",
}

/* The visitor total is read live from Redis on each request. */
export const dynamic = "force-dynamic"

/* Logo tile sizes per tier on the "On the wall" section, largest first. */
const LOGO: Record<Tier, { height: string; cols: string; image: { width: number; height: number; className: string }; text: string }> = {
  diamond: { height: "h-40", cols: "sm:grid-cols-1", image: { width: 240, height: 48, className: "h-12" }, text: "text-4xl" },
  gold: { height: "h-32", cols: "sm:grid-cols-2", image: { width: 200, height: 40, className: "h-10" }, text: "text-3xl" },
  silver: { height: "h-28", cols: "sm:grid-cols-2", image: { width: 160, height: 32, className: "h-8" }, text: "text-2xl" },
}

export default async function SponsorPage() {
  const [visitors, items] = await Promise.all([getVisitorCount(), getSummaries()])
  const slots = TIERS.reduce((n, t) => n + t.slots, 0)
  const open = slots - Math.min(slots, SPONSORS.length)

  return (
    <div className="relative w-full overflow-x-clip">
      {/* Hero: an empty gilt frame on the gallery wall. */}
      <section className="relative isolate border-b bg-[#F4F2EE] dark:bg-transparent">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <GrainOverlay opacity={0.12} className="-z-10" />

        <div className="mx-auto grid w-full max-w-5xl items-center gap-14 px-4 pt-14 pb-20 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:pt-20 lg:pb-24">
          <div>
            <Eyebrow className="cc-rise">Sponsor · {open > 0 ? `${open} of ${slots} slots open` : "All slots taken"}</Eyebrow>
            <h1 className="mt-6 font-serif text-[2.75rem] leading-[0.95] tracking-[-0.02em] sm:text-6xl lg:text-[4.25rem]">
              <span className="cc-rise block" style={delay(100)}>
                Hang your name
              </span>
              <span className="cc-rise block text-muted-foreground italic" style={delay(200)}>
                in the gallery.
              </span>
            </h1>
            <p
              className="cc-rise mt-7 max-w-[46ch] text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
              style={delay(300)}
            >
              creative-ui is free and MIT licensed. Sponsors fund new components and skills, and their logo sits in
              front of the developers who install them.
            </p>
            <div className="cc-rise mt-9 flex flex-wrap gap-3" style={delay(400)}>
              <PillLink href={SPONSOR_URL} external variant="solid">
                <HugeiconsIcon icon={FavouriteIcon} className="size-4" style={{ color: GOLD }} strokeWidth={2} />
                Become a sponsor
              </PillLink>
              <PillLink href="#tiers">See the tiers</PillLink>
            </div>
          </div>

          <div className="cc-rise relative mx-auto w-full max-w-[320px] lg:mr-0" style={delay(250)}>
            <CollageFrame
              src="/art/arch-keystone.webp"
              alt="Oil painting of a hand placing a gold coin as the keystone of a stone arch, in a gilt museum frame"
              shape="museum"
              frameColor="#b08d4a"
              tilt={1}
              className="aspect-[4/5] w-full"
            >
              <CollageFrameOverlay position="bottom" hang={30} className="cc-float">
                <Plaque />
              </CollageFrameOverlay>
            </CollageFrame>
          </div>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-8">
        {/* Reach */}
        <dl className="grid grid-cols-2 gap-y-10 border-b py-14 sm:grid-cols-4">
          <Stat value={visitors === null ? "—" : compact(visitors)} label="Unique visitors" />
          <Stat value={items.length} label="Items in the registry" />
          <Stat value={slots} label="Sponsor slots" />
          <Stat value="MIT" label="License" />
        </dl>

        {/* Tiers */}
        <section id="tiers" className="scroll-mt-20 py-20">
          <SectionHeading eyebrow="Tiers" title="Three ways to show up." />
          <div className="grid gap-6 lg:grid-cols-3">
            {TIERS.map(({ tier, label, price, slots, summary, perks }) => {
              const taken = SPONSORS.filter((s) => s.tier === tier).length
              const left = Math.max(0, slots - taken)
              const diamond = tier === "diamond"
              return (
                <Card
                  key={tier}
                  className={cn(
                    "relative isolate gap-0 overflow-hidden rounded-2xl p-7 shadow-none sm:p-8",
                    diamond && "border-transparent bg-[#111214] text-white ring-1 ring-white/10",
                    tier === "gold" && "border-[#B8893A]/50"
                  )}
                >
                  {diamond && <GrainOverlay opacity={0.22} />}
                  <div className="flex items-baseline justify-between gap-3">
                    <h3
                      className="font-serif text-4xl tracking-[-0.01em]"
                      style={tier === "gold" ? { color: GOLD } : undefined}
                    >
                      {label}
                    </h3>
                    <span
                      className={cn(
                        "font-mono text-[11px] tracking-[.08em] uppercase",
                        diamond ? "text-white/55" : "text-muted-foreground"
                      )}
                    >
                      {left > 0 ? `${left} of ${slots} open` : "Full"}
                    </span>
                  </div>
                  <p className="mt-6 flex items-baseline gap-1.5">
                    <span className="font-serif text-6xl leading-none tracking-[-0.02em]">${price}</span>
                    <span
                      className={cn(
                        "font-mono text-[11px] tracking-[.08em] uppercase",
                        diamond ? "text-white/55" : "text-muted-foreground"
                      )}
                    >
                      / month
                    </span>
                  </p>
                  <p className={cn("mt-4", diamond ? "text-white/65" : "text-muted-foreground")}>{summary}</p>
                  <ul className="mt-7 flex flex-1 flex-col gap-3 text-sm">
                    {perks.map((perk) => (
                      <li key={perk} className="flex gap-2.5">
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          className="mt-px size-4 shrink-0"
                          style={{ color: GOLD }}
                          strokeWidth={2}
                        />
                        <span className={diamond ? "text-white/85" : undefined}>{perk}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-9">
                    <PillLink href={SPONSOR_URL} external variant={diamond ? "light" : "solid"}>
                      {left > 0 ? `Sponsor at ${label}` : "Join the waitlist"}
                      <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
                    </PillLink>
                  </div>
                </Card>
              )
            })}
          </div>
          <p className="mt-6 font-mono text-[11px] text-muted-foreground">
            Prices in USD, billed monthly through GitHub Sponsors. Already sponsoring?{" "}
            <Link href="/sponsor/apply" className="underline underline-offset-4 hover:text-foreground">
              Send your details
            </Link>
            .
          </p>
        </section>

        {/* Current sponsors */}
        <section className="border-t py-20">
          <SectionHeading eyebrow="On the wall" title="Current sponsors." />
          {SPONSORS.length === 0 ? (
            <a
              href={SPONSOR_URL}
              target="_blank"
              rel="noreferrer"
              className="group flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed px-6 py-16 text-center transition-colors hover:border-foreground/30"
            >
              <span className="grid size-10 place-items-center rounded-full border text-muted-foreground transition-colors group-hover:text-foreground">
                <HugeiconsIcon icon={PlusSignIcon} className="size-4" strokeWidth={2} />
              </span>
              <p className="font-serif text-3xl tracking-[-0.01em]">The wall is empty.</p>
              <p className="max-w-[40ch] text-sm text-muted-foreground">
                The first sponsor gets the gallery to themselves.
              </p>
            </a>
          ) : (
            <div className="flex flex-col gap-10">
              {TIERS.map(({ tier, label }) => {
                const sponsors = SPONSORS.filter((s) => s.tier === tier)
                if (sponsors.length === 0) return null
                return (
                  <div key={tier}>
                    <p className="mb-4 font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase">
                      {label}
                    </p>
                    <div className={cn("grid gap-4", LOGO[tier].cols)}>
                      {sponsors.map((s) => (
                        <SponsorLogo key={s.name} sponsor={s} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* How it works */}
        <section className="border-t py-20">
          <SectionHeading eyebrow="How it works" title="Three steps to the wall." />
          <div className="grid gap-10 sm:grid-cols-3">
            <Step n="01" title="Pick a tier" body="Sponsor monthly on GitHub at Diamond ($250), Gold ($150) or Silver ($50)." />
            <Step n="02" title="Send your logo" body="Fill in the form with your logo (SVG works best), a link and, for Diamond, an offer for our users." />
            <Step n="03" title="Go live" body="Your logo appears in the docs sidebar and on this page on the next deploy." />
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-5">
            <PillLink href="/sponsor/apply" variant="solid">
              Send your details
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
            </PillLink>
            <Link
              href="/docs"
              className="group inline-flex items-center gap-1.5 text-sm font-medium underline-offset-4 hover:underline"
            >
              See where sponsors appear in the docs
              <HugeiconsIcon
                icon={ArrowRight01Icon}
                className="size-4 transition-transform group-hover:translate-x-0.5"
                strokeWidth={2}
              />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}

function compact(n: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n)
}

/** The brass plaque under the frame, waiting for a name. */
function Plaque() {
  return (
    <div className="w-[min(240px,70vw)] rounded-md bg-[#111214] px-4 py-3 text-center text-white shadow-2xl ring-1 ring-white/10">
      <p className="font-mono text-[10px] tracking-[.12em] uppercase" style={{ color: GOLD }}>
        Diamond sponsor
      </p>
      <p className="mt-1 font-serif text-xl italic">Your name here</p>
    </div>
  )
}

function SponsorLogo({ sponsor }: { sponsor: Sponsor }) {
  const size = LOGO[sponsor.tier]
  return (
    <a
      href={sponsor.href}
      target="_blank"
      rel="noreferrer sponsored"
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border bg-card px-6 text-center transition-colors hover:bg-accent",
        size.height
      )}
    >
      {sponsor.logo ? (
        <Image
          src={sponsor.logo}
          alt={sponsor.name}
          width={size.image.width}
          height={size.image.height}
          className={cn("w-auto object-contain dark:invert", size.image.className)}
        />
      ) : (
        <span className={cn("font-serif tracking-[-0.01em]", size.text)}>{sponsor.name}</span>
      )}
      {sponsor.tier === "diamond" && sponsor.offer && <span className="text-sm text-balance text-muted-foreground">{sponsor.offer}</span>}
    </a>
  )
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-12">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.02em] sm:text-6xl">{title}</h2>
    </div>
  )
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="flex flex-col-reverse px-1">
      <dt className="mt-3 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">{label}</dt>
      <dd className="font-serif text-6xl leading-none tracking-[-0.02em] sm:text-7xl">{value}</dd>
    </div>
  )
}

function Step({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div>
      <p className="font-mono text-[11px] tracking-[.08em] text-muted-foreground">{n} —</p>
      <h3 className="mt-2 font-serif text-3xl tracking-[-0.01em]">{title}</h3>
      <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
    </div>
  )
}
