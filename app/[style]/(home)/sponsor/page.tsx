import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, CheckmarkCircle02Icon, FavouriteIcon, PlusSignIcon } from "@hugeicons/core-free-icons"

import { getSummaries } from "@/lib/registry"
import { pageMetadata } from "@/lib/seo"
import {
  LAUNCH_OFFER,
  PLATFORM_SPONSORS,
  SPONSORS,
  SPONSOR_EMAIL,
  TIERS,
  X_HANDLE,
  offerPrice,
  type Sponsor,
  type Tier,
} from "@/lib/sponsors"
import { cn } from "@/lib/utils"
import { styleOf, type StyleParams } from "@/lib/ui-style"
import { getPageViewCount, getVisitorCount } from "@/lib/visitors"
import { Card } from "@/components/ui/card"
import { BRAND, Eyebrow, GOLD, PillLink, delay } from "@/components/home-primitives"
import { StackSteps } from "@/components/home/stack-steps"
import { StepGrid } from "@/components/modern/step-grid"
import { PageViewTotal, VisitorTotal } from "@/components/visitor-count"
import { CollageFrame, CollageFrameOverlay } from "@/registry/new-york/blocks/collage-frame/collage-frame"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"

/* Sponsor page in the same Classical Collage direction as home. The metaphor: a gallery
   wall with a gilt frame waiting for its plaque. */

export const metadata: Metadata = pageMetadata({
  title: "Sponsor",
  description: "Sponsor creative-ui and put your logo in front of the developers who install it.",
  path: "/sponsor",
})

/* Visitor and page view totals are read live from Redis on each request, then synced with the nav on the client. */
export const dynamic = "force-dynamic"

/* Logo tile sizes per tier on the "On the wall" section, largest first. Widths hang the
   tiers as a pyramid: one Diamond on top, two Gold, three Silver across the base. */
const STEPS = [
  {
    n: "01",
    title: "Pick a tier, add your logo.",
    body: "Choose Diamond ($250), Gold ($150) or Silver ($50) a month, tax included. Add your logo (SVG works best), a link and, for Diamond, an optional tagline or offer.",
    art: { src: "/art/hands-card.webp", alt: "Oil painting of hands in red velvet presenting a blank marble card" },
  },
  {
    n: "02",
    title: "Pay with Dodo.",
    body: `The form takes you straight to checkout.${
      LAUNCH_OFFER ? ` Code ${LAUNCH_OFFER.code} is applied for you, taking ${LAUNCH_OFFER.percent}% off your first ${LAUNCH_OFFER.months} months.` : ""
    } Card details go to Dodo Payments, never this site.`,
    art: { src: "/art/cherub-swatches.webp", alt: "Oil painting of a cherub holding a paintbrush and a fan of colour swatches" },
  },
  {
    n: "03",
    title: "Go live.",
    body: "Your logo appears in the docs sidebar and on this page on the next deploy, normally within 7 days. Cancel from the Dodo customer portal whenever you like.",
    art: { src: "/art/arch-laurel.webp", alt: "Oil painting of a hand setting a carved marble keystone into an arch" },
  },
]

const LOGO: Record<Tier, { height: string; width: string; image: { width: number; height: number; className: string }; text: string }> = {
  diamond: { height: "h-40", width: "sm:w-2/3", image: { width: 240, height: 48, className: "h-12" }, text: "text-4xl" },
  gold: { height: "h-32", width: "sm:w-5/12", image: { width: 200, height: 40, className: "h-10" }, text: "text-3xl" },
  silver: { height: "h-28", width: "sm:w-[calc((100%-2rem)/3)]", image: { width: 160, height: 32, className: "h-8" }, text: "text-2xl" },
}

export default async function SponsorPage({ params }: { params: StyleParams }) {
  const [visitors, views, items, style] = await Promise.all([
    getVisitorCount(),
    getPageViewCount(),
    getSummaries(),
    styleOf(params),
  ])
  const modern = style === "modern"
  const slots = TIERS.reduce((n, t) => n + t.slots, 0)
  const open = slots - Math.min(slots, SPONSORS.length)

  return (
    <div className="relative w-full overflow-x-clip">
      {/* Hero: an empty gilt frame on the gallery wall. */}
      <section className="relative isolate border-b bg-paper">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <GrainOverlay opacity={0.12} className="-z-10 modern:hidden" />

        <div className="mx-auto grid w-full max-w-5xl items-center gap-14 px-4 pt-14 pb-20 sm:px-8 lg:grid-cols-[1.25fr_0.75fr] lg:pt-20 lg:pb-24">
          <div>
            <Eyebrow className="cc-rise">
              Sponsor · {open > 0 ? `${open} of ${slots} slots open` : "All slots taken"}
              {LAUNCH_OFFER && ` · ${LAUNCH_OFFER.percent}% off at launch`}
            </Eyebrow>
            <h1 className="mt-6 font-serif text-[2.75rem] leading-[0.95] tracking-[-0.02em] sm:text-6xl lg:text-[4.25rem]">
              <span className="cc-rise block" style={delay(100)}>
                Hang your name
              </span>
              <span className="cc-rise block text-muted-foreground" style={delay(200)}>
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
              <PillLink href="#tiers" variant="solid">
                <HugeiconsIcon icon={FavouriteIcon} className="size-4" style={{ color: BRAND }} strokeWidth={2} />
                Become a sponsor
              </PillLink>
              <PillLink href="#how-it-works">How it works</PillLink>
            </div>
          </div>

          {modern ? (
            <SlotPreview />
          ) : (
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
          )}
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 pb-24 sm:px-8">
        {/* Reach */}
        <dl className="grid grid-cols-2 gap-y-10 border-b py-14 sm:grid-cols-4">
          <Stat value={<VisitorTotal initial={visitors} />} label="Unique visitors" />
          <Stat value={<PageViewTotal initial={views} />} label="Page views" />
          <Stat value={items.length} label="Items in the registry" />
          <Stat value={slots} label="Sponsor slots" />
        </dl>

        {/* How it works: three moves, stacked like prints laid on a table, as on home. */}
        <section id="how-it-works" className="scroll-mt-20 py-20">
          <SectionHeading eyebrow="How it works" title="Three steps to the wall." />
          {modern ? <StepGrid steps={STEPS} /> : <StackSteps steps={STEPS} />}
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-5">
            <PillLink href="#tiers" variant="solid">
              <HugeiconsIcon icon={FavouriteIcon} className="size-4" style={{ color: BRAND }} strokeWidth={2} />
              Pick a tier
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

        {/* Tiers */}
        <section id="tiers" className="scroll-mt-20 border-t py-20">
          <SectionHeading eyebrow="Tiers" title="Three ways to show up." />
          {LAUNCH_OFFER && <LaunchOffer offer={LAUNCH_OFFER} />}
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
                  {diamond && <GrainOverlay opacity={0.22} className="modern:hidden" />}
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
                    <span className="font-serif text-6xl leading-none tracking-[-0.02em]">${offerPrice(price)}</span>
                    {LAUNCH_OFFER && (
                      <s className={cn("font-serif text-2xl", diamond ? "text-white/45" : "text-muted-foreground")}>
                        <span className="sr-only">Full price </span>${price}
                      </s>
                    )}
                    <span
                      className={cn(
                        "font-mono text-[11px] tracking-[.08em] uppercase",
                        diamond ? "text-white/55" : "text-muted-foreground"
                      )}
                    >
                      / month
                    </span>
                  </p>
                  {LAUNCH_OFFER && (
                    <p className="mt-2 font-mono text-[11px] tracking-[.08em] uppercase" style={{ color: BRAND }}>
                      First {LAUNCH_OFFER.months} months, then ${price}
                    </p>
                  )}
                  <p className={cn("mt-4", diamond ? "text-white/65" : "text-muted-foreground")}>{summary}</p>
                  <ul className="mt-7 flex flex-1 flex-col gap-3 text-sm">
                    {perks.map((perk) => (
                      <li key={perk} className="flex gap-2.5">
                        <HugeiconsIcon
                          icon={CheckmarkCircle02Icon}
                          className="mt-px size-4 shrink-0"
                          style={{ color: BRAND }}
                          strokeWidth={2}
                        />
                        <span className={diamond ? "text-white/85" : undefined}>{perk}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-9">
                    {left > 0 ? (
                      <PillLink href={`/sponsor/apply?tier=${tier}`} variant={diamond ? "light" : "solid"}>
                        Sponsor at {label}
                        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
                      </PillLink>
                    ) : (
                      <PillLink
                        href={`mailto:${SPONSOR_EMAIL}?subject=${encodeURIComponent(`${label} sponsor waitlist`)}`}
                        external
                        variant={diamond ? "light" : "solid"}
                      >
                        Join the waitlist
                        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
                      </PillLink>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
          <div className="mx-auto mt-10 max-w-[68ch] space-y-3 text-center text-[13px] leading-relaxed text-pretty text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a]:transition-colors [&_a:hover]:text-foreground">
            <p>
              Prices in USD per month, with any sales tax or VAT already included.{" "}
              {LAUNCH_OFFER &&
                `The launch discount covers your first ${LAUNCH_OFFER.months} monthly payments, then the subscription renews at the full price shown. `}
              Each tier renews monthly until you cancel, which you can do any time from the Dodo Payments customer
              portal, by emailing <a href={`mailto:${SPONSOR_EMAIL}`}>{SPONSOR_EMAIL}</a> or with a DM on X to{" "}
              <a href={`https://x.com/${X_HANDLE}`} target="_blank" rel="noreferrer">
                @{X_HANDLE}
              </a>
              . Cancel and ask within
              24 hours of a charge to get that charge refunded.
            </p>
            <p>
              Dodo Payments is the merchant of record, so the charge and invoice come from them. By checking out you
              agree to the <Link href="/terms">terms</Link>, <Link href="/privacy">privacy policy</Link> and{" "}
              <Link href="/refund-policy">refund and cancellation policy</Link>.
            </p>
          </div>
          <PlatformOffer />
        </section>

        {/* Current sponsors */}
        <section className="border-t py-20">
          <SectionHeading eyebrow="On the wall" title="Current sponsors." />
          {SPONSORS.length === 0 ? (
            <a
              href="#tiers"
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
                    <p className="mb-4 text-center font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase">
                      {label}
                    </p>
                    <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
                      {sponsors.map((s) => (
                        <SponsorLogo key={s.name} sponsor={s} />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
          {PLATFORM_SPONSORS.length > 0 && (
            <div className="mt-10">
              <p className="mb-4 text-center font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase">
                Platform
              </p>
              <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
                {PLATFORM_SPONSORS.map((p) => (
                  <li key={p.name}>
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noreferrer sponsored"
                      className="flex flex-col items-center gap-1 opacity-70 grayscale transition-[opacity,filter] hover:opacity-100 hover:grayscale-0"
                    >
                      {p.logo ? (
                        <Image src={p.logo} alt={p.name} width={140} height={28} className="h-7 w-auto object-contain dark:invert" />
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
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

/** The launch code. It is applied at checkout, so it is shown here rather than asked for. */
function LaunchOffer({ offer }: { offer: NonNullable<typeof LAUNCH_OFFER> }) {
  return (
    <div className="-mt-4 mb-8 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border border-brand/50 bg-brand/[0.06] px-5 py-4">
      <span className="font-mono text-[11px] tracking-[.08em] uppercase" style={{ color: BRAND }}>
        Launch offer
      </span>
      <p className="text-sm">
        <span className="font-medium">
          {offer.percent}% off your first {offer.months} months
        </span>
        <span className="text-muted-foreground"> on every tier with code </span>
        <code className="rounded-md border bg-background px-1.5 py-0.5 font-mono text-xs font-medium tracking-[.06em]">
          {offer.code}
        </code>
        <span className="text-muted-foreground">. It&apos;s applied for you at checkout.</span>
      </p>
    </div>
  )
}

/** The unpaid route: credits, hosting or tools instead of a monthly tier. */
function PlatformOffer() {
  return (
    <div className="mt-12 grid gap-6 rounded-2xl border border-dashed p-7 sm:p-8 md:grid-cols-[1fr_auto] md:items-center md:gap-10">
      <div>
        <Eyebrow>Platform sponsor · No payment</Eyebrow>
        <h3 className="mt-4 font-serif text-3xl leading-[1.05] tracking-[-0.01em] sm:text-4xl">
          Or back it with your platform.
        </h3>
        <p className="mt-3 max-w-[56ch] text-sm leading-relaxed text-pretty text-muted-foreground">
          Offer credits, hosting or tools that creative-ui runs on, and your logo goes in the platform sponsor strip
          on the home page.
        </p>
      </div>
      <PillLink href="/sponsor/platform" className="justify-self-start">
        Become a platform sponsor
        <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
      </PillLink>
    </div>
  )
}

/** Modern hero: the sponsor slot as it appears in the docs sidebar, waiting for a logo. */
function SlotPreview() {
  return (
    <div className="cc-rise mx-auto w-full max-w-[340px] lg:mr-0" style={delay(250)}>
      <div className="rounded-xl border bg-card p-2 shadow-[0_8px_30px_-12px_rgb(0_0_0/0.15)]">
        <div className="flex items-center gap-1.5 border-b px-2 pb-2">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full bg-muted-foreground/20" />
          ))}
          <span className="ml-2 font-mono text-[11px] text-muted-foreground">/docs</span>
        </div>
        <div className="space-y-2 p-3">
          {["w-3/4", "w-1/2", "w-2/3"].map((w) => (
            <div key={w} className={cn("h-2 rounded-full bg-muted", w)} />
          ))}
          <div className="mt-5 flex aspect-[5/3] flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-brand/60 bg-brand/[0.04]">
            <HugeiconsIcon icon={PlusSignIcon} className="size-4 text-brand" strokeWidth={2} />
            <p className="text-sm font-medium">Your logo here</p>
            <p className="font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">Diamond sponsor</p>
          </div>
          {["w-1/2", "w-3/5"].map((w) => (
            <div key={w} className={cn("h-2 rounded-full bg-muted", w)} />
          ))}
        </div>
      </div>
    </div>
  )
}

/** The brass plaque under the frame, waiting for a name. */
function Plaque() {
  return (
    <div className="w-[min(240px,70vw)] rounded-md bg-[#111214] px-4 py-3 text-center text-white shadow-2xl ring-1 ring-white/10">
      <p className="font-mono text-[10px] tracking-[.12em] uppercase" style={{ color: BRAND }}>
        Diamond sponsor
      </p>
      <p className="mt-1 font-serif text-xl">Your name here</p>
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
        "flex min-w-0 flex-col items-center justify-center gap-2 rounded-2xl border bg-card px-6 text-center transition-colors hover:bg-accent",
        size.height,
        size.width
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

function Stat({ value, label }: { value: React.ReactNode; label: string }) {
  return (
    <div className="flex flex-col-reverse px-1">
      <dt className="mt-3 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">{label}</dt>
      <dd className="font-serif text-6xl leading-none tracking-[-0.02em] sm:text-7xl">{value}</dd>
    </div>
  )
}
