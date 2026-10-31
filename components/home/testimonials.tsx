import Image from "next/image"

import { SITE_URL } from "@/lib/registry"
import { X_HANDLE } from "@/lib/sponsors"
import { TESTIMONIALS } from "@/lib/testimonials"
import { Eyebrow, BRAND, PillLink } from "@/components/home-primitives"
import { TestimonialCard } from "@/components/home/testimonial-card"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"

/* A statue writing on a tablet beside the quote it wrote: words set down to last.
   Until there are real quotes, the card invites one instead. */

const SHARE_URL = `https://x.com/intent/post?${new URLSearchParams({
  text: "Shipped with creative-ui:",
  url: SITE_URL,
  via: X_HANDLE,
})}`

export function Testimonials() {
  return (
    <section className="py-20">
      <div className="mb-12">
        <Eyebrow>In their words</Eyebrow>
        <h2 className="mt-4 font-serif text-5xl leading-[0.95] tracking-[-0.02em] sm:text-6xl">Set in stone.</h2>
      </div>

      <div className="grid gap-4 lg:grid-cols-[5fr_7fr]">
        <div className="relative isolate aspect-[4/3] overflow-hidden rounded-2xl ring-1 ring-border lg:aspect-auto lg:min-h-[28rem]">
          <Image
            src="/art/statue-tablet.webp"
            alt="Oil painting of a marble statue seated on a plinth, writing on a dark tablet with a stylus"
            fill
            sizes="(min-width: 1024px) 400px, 100vw"
            className="-z-10 object-cover object-[50%_35%]"
          />
          <GrainOverlay opacity={0.18} />
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/65 to-transparent" />
          <p className="absolute bottom-6 left-6 max-w-[14ch] font-serif text-3xl leading-[1] tracking-[-0.02em] text-white sm:text-4xl">
            Trusted by those who ship.
          </p>
        </div>

        <div className="relative flex min-w-0 flex-col rounded-2xl bg-card p-8 ring-1 ring-border sm:p-10">
          <span aria-hidden className="font-serif text-7xl leading-[0.6]" style={{ color: BRAND }}>
            &ldquo;
          </span>
          {TESTIMONIALS.length > 0 ? (
            <TestimonialCard testimonials={TESTIMONIALS} />
          ) : (
            <div className="mt-6 flex flex-1 flex-col">
              <p className="max-w-[20ch] font-serif text-3xl leading-[1.1] tracking-[-0.01em] text-balance sm:text-4xl">
                Your words here.
              </p>
              <p className="mt-5 max-w-[46ch] leading-relaxed text-pretty text-muted-foreground">
                Shipped something with a creative-ui component or skill? Post about it on X, and with your
                permission it goes on this wall.
              </p>
              <div className="mt-auto pt-10">
                <PillLink href={SHARE_URL} external>
                  Share your words
                </PillLink>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
