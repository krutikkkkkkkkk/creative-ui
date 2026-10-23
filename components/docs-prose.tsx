import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ArrowRight01Icon } from "@hugeicons/core-free-icons"

/** Shared building blocks for prose docs pages (Introduction, Get started). */

export function DocPage({
  title,
  description,
  children,
}: {
  title: string
  description: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-10 pb-24 sm:px-8">
      <div className="flex flex-col gap-4">
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">{title}</h1>
        <p className="max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
  )
}

export function Section({
  id,
  title,
  aside,
  children,
}: {
  id?: string
  title: string
  aside?: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mt-12 scroll-mt-20">
      <div className="mb-4 flex items-baseline justify-between border-b pb-2">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {aside && <span className="font-mono text-xs text-muted-foreground">{aside}</span>}
      </div>
      {children}
    </section>
  )
}

export function Step({
  n,
  title,
  body,
  children,
}: {
  n: string
  title: string
  body?: React.ReactNode
  children?: React.ReactNode
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div>
        <h3 className="font-medium">
          <span className="mr-2 font-mono text-xs text-muted-foreground">{n}.</span>
          {title}
        </h3>
        {body && <p className="mt-1 text-sm text-muted-foreground">{body}</p>}
      </div>
      {children}
    </div>
  )
}

export function Code({ children }: { children: React.ReactNode }) {
  return <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">{children}</code>
}

export function Note({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={className ?? "text-sm text-muted-foreground"}>{children}</p>
}

/** Previous / next links at the bottom of a Get started page. */
export function Pager({
  prev,
  next,
}: {
  prev?: { href: string; label: string }
  next?: { href: string; label: string }
}) {
  return (
    <nav className="mt-16 flex items-center justify-between gap-4 border-t pt-6 text-sm">
      {prev ? (
        <Link href={prev.href} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">
          <HugeiconsIcon icon={ArrowLeft01Icon} className="size-4" strokeWidth={2} />
          {prev.label}
        </Link>
      ) : (
        <span />
      )}
      {next && (
        <Link href={next.href} className="inline-flex items-center gap-1 font-medium hover:underline">
          {next.label}
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
        </Link>
      )}
    </nav>
  )
}
