import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowUpRight01Icon, FavouriteIcon, GithubIcon } from "@hugeicons/core-free-icons"

import { COMPANY_NAME, COMPANY_URL, GITHUB_URL, SITE_URL } from "@/lib/registry"
import { SPONSOR_URL } from "@/lib/sponsors"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { GrainOverlay } from "@/registry/new-york/blocks/grain-overlay/grain-overlay"

const BRAND = "var(--brand)"

type FooterLink = { label: string; href: string; external?: boolean }

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Registry",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "Installation", href: "/#installation" },
      { label: "Components", href: "/docs" },
      { label: "Claude skills", href: "/docs" },
      { label: "registry.json", href: "/r/registry.json", external: true },
    ],
  },
  {
    title: "Project",
    links: [
      { label: "GitHub", href: GITHUB_URL, external: true },
      { label: "Contributing", href: `${GITHUB_URL}/blob/main/CONTRIBUTING.md`, external: true },
      { label: "Issues", href: `${GITHUB_URL}/issues`, external: true },
      { label: "Sponsor", href: "/sponsor" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Sponsors", href: "/sponsor" },
      { label: "Refunds & cancellation", href: "/refund-policy" },
      { label: "License", href: "/license" },
    ],
  },
]

export function SiteFooter({ className }: { className?: string }) {
  const year = new Date().getFullYear()
  return (
    <footer className={cn("relative isolate overflow-hidden border-t bg-paper", className)}>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_top,black,transparent)]"
      />
      <GrainOverlay opacity={0.1} className="-z-10 modern:hidden" />

      <div className="mx-auto w-full max-w-5xl px-4 pt-16 sm:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div className="max-w-xs">
            <Link href="/" className="flex items-center gap-2.5">
              <Logo className="size-7" />
              <span className="font-semibold tracking-tight">creative-ui</span>
            </Link>
            <p className="mt-5 font-serif text-2xl leading-tight tracking-[-0.01em]">
              Timeless craft, <span className="text-muted-foreground">one command away.</span>
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
              Components and Claude skills by Krutik Raut at{" "}
              <a
                href={COMPANY_URL}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-4 transition-colors hover:text-foreground"
              >
                {COMPANY_NAME}
              </a>
              , installable with the shadcn CLI.
            </p>
            <div className="mt-6 flex gap-2">
              <FooterIcon href={GITHUB_URL} label="GitHub">
                <HugeiconsIcon icon={GithubIcon} className="size-4" strokeWidth={2} />
              </FooterIcon>
              <FooterIcon href={SPONSOR_URL} label="Sponsor creative-ui">
                <HugeiconsIcon icon={FavouriteIcon} className="size-4" style={{ color: BRAND }} strokeWidth={2} />
              </FooterIcon>
            </div>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="font-mono text-[11px] tracking-[.08em] text-muted-foreground uppercase">
                <span className="modern:hidden">{"// "}</span>
                {col.title}
              </p>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <FooterLink link={l} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t py-6 font-mono text-[11px] tracking-[.04em] text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} Krutik Raut · An{" "}
            <a href={COMPANY_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-foreground">
              {COMPANY_NAME}
            </a>{" "}
            project · MIT licensed ·{" "}
            <a href={SITE_URL} className="transition-colors hover:text-foreground">
              {SITE_URL.replace("https://", "")}
            </a>
          </p>
          <p className="modern:hidden">Art: public-domain paintings and original generated work.</p>
        </div>
      </div>

      {/* Mega word, cut by the bottom edge. */}
      <div aria-hidden className="pointer-events-none relative mx-auto h-[clamp(4rem,11vw,9.5rem)] w-full max-w-5xl overflow-hidden px-4 select-none sm:px-8">
        <span className="absolute top-[0.12em] left-4 font-serif text-[clamp(5rem,14.5vw,13rem)] leading-none tracking-[-0.05em] text-foreground/[0.06] sm:left-8">
          creative-ui
        </span>
      </div>
    </footer>
  )
}

function FooterLink({ link }: { link: FooterLink }) {
  const className =
    "group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
  if (link.external) {
    return (
      <a href={link.href} target="_blank" rel="noreferrer" className={className}>
        {link.label}
        <HugeiconsIcon
          icon={ArrowUpRight01Icon}
          className="size-3 opacity-0 transition-opacity group-hover:opacity-100"
          strokeWidth={2}
        />
      </a>
    )
  }
  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  )
}

function FooterIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <Button variant="outline" size="icon" className="rounded-full bg-background/60 shadow-none" asChild>
      <a href={href} aria-label={label} {...(href.startsWith("/") ? {} : { target: "_blank", rel: "noreferrer" })}>
        {children}
      </a>
    </Button>
  )
}
