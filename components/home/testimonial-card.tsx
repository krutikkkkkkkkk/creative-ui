"use client"

import * as React from "react"
import Image from "next/image"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

import type { Testimonial } from "@/lib/testimonials"
import { Button } from "@/components/ui/button"

/* The quote, its attribution and prev/next arrows. Each change re-mounts the quote so it
   settles in with a short, interruptible fade; reduced motion swaps it instantly. */

export function TestimonialCard({ testimonials }: { testimonials: Testimonial[] }) {
  const [index, setIndex] = React.useState(0)
  const count = testimonials.length
  const t = testimonials[index]
  const step = (dir: 1 | -1) => setIndex((i) => (i + dir + count) % count)

  return (
    <div className="mt-6 flex flex-1 flex-col" aria-roledescription="carousel" aria-label="Testimonials">
      <figure
        key={index}
        aria-live="polite"
        className="flex flex-1 flex-col duration-300 ease-out animate-in fade-in slide-in-from-bottom-1 motion-reduce:animate-none"
      >
        <blockquote className="font-serif text-2xl leading-[1.25] tracking-[-0.01em] text-pretty sm:text-[1.75rem]">
          {t.quote}
        </blockquote>
        <figcaption className="mt-auto flex items-center gap-3 pt-10">
          {t.avatar ? (
            <Image src={t.avatar} alt="" width={40} height={40} className="size-10 rounded-full object-cover" />
          ) : (
            <span
              aria-hidden
              className="flex size-10 items-center justify-center rounded-full bg-muted font-mono text-[11px] tracking-[.04em]"
            >
              {initials(t.name)}
            </span>
          )}
          <div className="min-w-0 text-sm">
            {t.href ? (
              <a href={t.href} target="_blank" rel="noreferrer" className="font-medium underline-offset-4 hover:underline">
                {t.name}
              </a>
            ) : (
              <p className="font-medium">{t.name}</p>
            )}
            <p className="truncate text-muted-foreground">{t.role}</p>
          </div>
        </figcaption>
      </figure>

      {count > 1 && (
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <p className="font-mono text-[11px] tracking-[.08em] text-muted-foreground tabular-nums">
            {String(index + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-none active:scale-[0.96]"
              aria-label="Previous testimonial"
              onClick={() => step(-1)}
            >
              <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-full shadow-none active:scale-[0.96]"
              aria-label="Next testimonial"
              onClick={() => step(1)}
            >
              <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("")
}
