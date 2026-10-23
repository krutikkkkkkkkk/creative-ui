import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import { GithubIcon } from "@hugeicons/core-free-icons"

import { GITHUB_URL } from "@/lib/registry"
import { cn } from "@/lib/utils"
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
        <nav className="flex items-center gap-1">
          <NavLink href="/docs">Docs</NavLink>
          <NavLink href="/docs#components" className="hidden sm:inline-flex">
            Components
          </NavLink>
          <NavLink href="/docs/installation/cli" className="hidden sm:inline-flex">
            Installation
          </NavLink>
          <NavLink href="/sponsor">Sponsor</NavLink>
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

function NavLink({ href, className, children }: { href: string; className?: string; children: React.ReactNode }) {
  return (
    <Button variant="ghost" size="sm" className={cn("px-2.5 font-normal text-muted-foreground", className)} asChild>
      <Link href={href}>{children}</Link>
    </Button>
  )
}
