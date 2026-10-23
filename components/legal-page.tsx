import Link from "next/link"

import { Eyebrow } from "@/components/home-primitives"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"

/* Shared shell for the legal pages: paper hero, serif title, calm prose. */

export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  children,
}: {
  eyebrow: string
  title: React.ReactNode
  updated: string
  intro: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="relative w-full overflow-x-clip">
      <section className="relative isolate border-b bg-[#F4F2EE] dark:bg-transparent">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]"
        />
        <GrainOverlay opacity={0.12} className="-z-10" />
        <div className="mx-auto w-full max-w-3xl px-4 pt-14 pb-14 sm:px-8 lg:pt-20 lg:pb-16">
          <Eyebrow className="cc-rise">
            {eyebrow} · Updated {updated}
          </Eyebrow>
          <h1
            className="cc-rise mt-6 font-serif text-[2.75rem] leading-[0.95] tracking-[-0.02em] text-balance sm:text-6xl"
            style={{ "--cc-delay": "100ms" } as React.CSSProperties}
          >
            {title}
          </h1>
          <p
            className="cc-rise mt-7 max-w-[56ch] text-base leading-relaxed text-pretty text-muted-foreground sm:text-lg"
            style={{ "--cc-delay": "220ms" } as React.CSSProperties}
          >
            {intro}
          </p>
        </div>
      </section>

      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-8">
        <div className="legal-prose">{children}</div>
        <p className="mt-16 border-t pt-6 font-mono text-[11px] tracking-[.04em] text-muted-foreground">
          Questions? Open an issue on{" "}
          <a
            href="https://github.com/krutikkkkkkkkk/creative-ui/issues"
            target="_blank"
            rel="noreferrer"
            className="underline underline-offset-4 hover:text-foreground"
          >
            GitHub
          </a>
          . See also <Link href="/privacy" className="underline underline-offset-4 hover:text-foreground">Privacy</Link>,{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-foreground">Terms</Link>,{" "}
          <Link href="/refund-policy" className="underline underline-offset-4 hover:text-foreground">Refunds</Link> and{" "}
          <Link href="/license" className="underline underline-offset-4 hover:text-foreground">License</Link>.
        </p>
      </div>
    </div>
  )
}

export function LegalSection({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-4 border-t py-10 first:border-t-0 first:pt-0 sm:grid-cols-[6rem_1fr]">
      <p className="font-mono text-[11px] tracking-[.08em] text-muted-foreground">{n} —</p>
      <div>
        <h2 className="font-serif text-3xl leading-tight tracking-[-0.01em]">{title}</h2>
        <div className="mt-4 space-y-4 leading-relaxed text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 [&_a:hover]:text-foreground [&_li]:pl-1 [&_strong]:font-medium [&_strong]:text-foreground [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </section>
  )
}
