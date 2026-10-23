import type { Metadata } from "next"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon } from "@hugeicons/core-free-icons"

import { pageMetadata } from "@/lib/seo"
import { Eyebrow, delay } from "@/components/home-primitives"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"

import { PlatformForm } from "./platform-form"

export const metadata: Metadata = pageMetadata({
  title: "Become a platform sponsor",
  description: "Back creative-ui with credits, hosting or tools, and your logo goes in the platform sponsor strip.",
  path: "/sponsor/platform",
})

export default function PlatformSponsorPage() {
  return (
    <div className="relative w-full overflow-x-clip">
      <section className="relative isolate border-b bg-[#F4F2EE] dark:bg-transparent">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <GrainOverlay opacity={0.12} className="-z-10" />

        <div className="mx-auto w-full max-w-5xl px-4 pt-14 pb-16 sm:px-8 lg:pt-20">
          <Link
            href="/sponsor"
            className="cc-rise inline-flex items-center gap-1.5 font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase hover:text-foreground"
          >
            <HugeiconsIcon icon={ArrowLeft01Icon} className="size-3.5" strokeWidth={2} />
            Sponsor
          </Link>
          <Eyebrow className="cc-rise mt-8">Platform sponsors · No payment</Eyebrow>
          <h1 className="mt-6 font-serif text-[2.75rem] leading-[0.95] tracking-[-0.02em] sm:text-6xl">
            <span className="cc-rise block" style={delay(100)}>
              Back it with your platform.
            </span>
          </h1>
          <p
            className="cc-rise mt-6 max-w-[52ch] text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
            style={delay(200)}
          >
            Offer credits, hosting or tools that creative-ui runs on, and your logo goes in the platform sponsor strip
            on the home page. Tell us what you have in mind and we&apos;ll reply by email.
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-5xl px-4 pt-12 pb-24 sm:px-8">
        <PlatformForm />
      </div>
    </div>
  )
}
