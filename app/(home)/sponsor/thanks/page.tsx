import type { Metadata } from "next"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { getApplication } from "@/lib/sponsor-applications"
import { SPONSOR_EMAIL, TIERS } from "@/lib/sponsors"
import { Eyebrow, GOLD, PillLink, delay } from "@/components/home-primitives"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"

export const metadata: Metadata = {
  title: "Thanks for sponsoring",
  robots: { index: false },
}

/* Dodo Payments sends sponsors here after checkout, with the subscription status in the URL.
   The webhook is what actually confirms the payment; this page only reports it. */
const FAILED = new Set(["failed", "cancelled", "expired"])

export default async function SponsorThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ application?: string; status?: string }>
}) {
  const { application: applicationId, status } = await searchParams
  const application = await getApplication(applicationId)
  const failed = status ? FAILED.has(status) : false
  const tier = TIERS.find((t) => t.tier === application?.tier)

  return (
    <div className="relative w-full overflow-x-clip">
      <section className="relative isolate bg-[#F4F2EE] dark:bg-transparent">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <GrainOverlay opacity={0.12} className="-z-10" />

        <div className="mx-auto flex min-h-[60svh] w-full max-w-3xl flex-col items-start justify-center px-4 py-20 sm:px-8">
          <Eyebrow className="cc-rise">Step 02 of 02 · Payment</Eyebrow>
          {failed ? (
            <>
              <h1
                className="cc-rise mt-6 font-serif text-[2.75rem] leading-[0.95] tracking-[-0.02em] sm:text-6xl"
                style={delay(100)}
              >
                The payment didn&apos;t go through.
              </h1>
              <p
                className="cc-rise mt-6 max-w-[52ch] text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
                style={delay(200)}
              >
                Nothing was charged. Your details are saved for a week, so you can try again without typing them out.
              </p>
              <div className="cc-rise mt-9 flex flex-wrap gap-3" style={delay(300)}>
                <PillLink
                  href={application ? `/sponsor/apply?application=${application.id}` : "/sponsor#tiers"}
                  variant="solid"
                >
                  Try again
                  <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
                </PillLink>
                <PillLink href={`mailto:${SPONSOR_EMAIL}`} external>
                  Email us
                </PillLink>
              </div>
            </>
          ) : (
            <>
              <HugeiconsIcon
                icon={CheckmarkCircle02Icon}
                className="cc-rise mt-8 size-8"
                style={{ ...delay(50), color: GOLD }}
                strokeWidth={2}
              />
              <h1
                className="cc-rise mt-5 font-serif text-[2.75rem] leading-[0.95] tracking-[-0.02em] sm:text-6xl"
                style={delay(100)}
              >
                {application ? `Welcome to the wall, ${application.name}.` : "Thanks for sponsoring."}
              </h1>
              <p
                className="cc-rise mt-6 max-w-[52ch] text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
                style={delay(200)}
              >
                {tier ? `Your ${tier.label} sponsorship is in. ` : ""}
                Dodo Payments emails your receipt, and your logo goes up on the next deploy, normally within 7 days.
                If anything about your logo needs changing, we&apos;ll email{" "}
                {application ? <span className="text-foreground">{application.email}</span> : "you"}.
              </p>
              <div className="cc-rise mt-9 flex flex-wrap gap-3" style={delay(300)}>
                <PillLink href="/sponsor" variant="solid">
                  Back to the sponsor page
                </PillLink>
                <PillLink href="/docs">See where your logo goes</PillLink>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  )
}
