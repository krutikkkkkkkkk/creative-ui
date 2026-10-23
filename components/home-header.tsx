import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { GithubIcon } from "@hugeicons/core-free-icons"

import { GITHUB_URL } from "@/lib/registry"
import { Logo } from "@/components/app-sidebar"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { VisitorCount } from "@/components/visitor-count"

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4 sm:px-8">
        <Link href="/" className="mr-4 flex items-center gap-2.5">
          <Logo className="size-7" />
          <span className="font-semibold tracking-tight">creative-ui</span>
        </Link>
        <nav className="flex items-center gap-1 text-sm">
          <Link href="/docs" className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground">
            Docs
          </Link>
          <Link
            href="/docs#installation"
            className="hidden rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground sm:block"
          >
            Installation
          </Link>
          <Link href="/sponsor" className="rounded-md px-2.5 py-1.5 text-muted-foreground transition-colors hover:text-foreground">
            Sponsor
          </Link>
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <VisitorCount className="mr-1 hidden sm:flex" />
          <Button variant="ghost" size="icon" className="size-8" asChild>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub">
              <HugeiconsIcon icon={GithubIcon} className="size-4" strokeWidth={2} />
            </a>
          </Button>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
