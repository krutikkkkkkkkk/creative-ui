import type { Metadata } from "next"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

import { pageMetadata } from "@/lib/seo"
import { getApplication } from "@/lib/sponsor-applications"
import { TIERS, type Tier } from "@/lib/sponsors"
import { Eyebrow, delay } from "@/components/home-primitives"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"

import { SponsorForm } from "./sponsor-form"

export const metadata: Metadata = pageMetadata({
  title: "Sponsor creative-ui",
  description: "Add the logo and link that go up on the creative-ui sponsor wall, then pay with Dodo Payments.",
  path: "/sponsor/apply",
})

export default async function SponsorApplyPage({
  searchParams,
}: {
  searchParams: Promise<{ tier?: string; application?: string }>
}) {
  const { tier, application: applicationId } = await searchParams
  /* Set when a payment didn't go through, so the sponsor doesn't type everything again. */
  const previous = await getApplication(applicationId)
  const requested = previous?.tier ?? tier
  const defaultTier: Tier = TIERS.some((t) => t.tier === requested) ? (requested as Tier) : "diamond"
  const initialValues = previous
    ? {
        name: previous.name,
        website: previous.website,
        logo: previous.logo,
        offer: previous.offer,
        contact: previous.contact,
        email: previous.email,
        notes: previous.notes,
      }
    : undefined

  return (
    <div className="relative w-full overflow-x-clip">
      <section className="relative isolate border-b bg-paper">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <GrainOverlay opacity={0.12} className="-z-10 modern:hidden" />

        <div className="mx-auto w-full max-w-5xl px-4 pt-14 pb-16 sm:px-8 lg:pt-20">
          <Link
            href="/sponsor"
            className="cc-rise inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" strokeWidth={2} />
            Sponsor
          </Link>
          <Eyebrow className="cc-rise mt-8">Step 01 of 02 · Your details</Eyebrow>
          <h1 className="mt-6 font-serif text-[2.75rem] leading-[0.95] tracking-[-0.02em] sm:text-6xl">
            <span className="cc-rise block" style={delay(100)}>
              Fill in the plaque.
            </span>
          </h1>
          <p
            className="cc-rise mt-6 max-w-[52ch] text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
            style={delay(200)}
          >
            Tell us what goes on the wall, then pay with Dodo Payments. Your logo goes up once the payment comes
            through. Diamond sponsors can add a tagline or offer under their logo.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 pt-12 pb-24 sm:px-8">
        <SponsorForm defaultTier={defaultTier} initialValues={initialValues} />
      </div>
    </div>
  )
}
