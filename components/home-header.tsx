import Link from "next/link"
import { getStarCount } from "@/lib/github"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { Button } from "@/components/ui/button"
import { GithubLink } from "@/components/github-link"
import { ThemeToggle } from "@/components/theme-toggle"
import { VisitorCount } from "@/components/visitor-count"

export async function HomeHeader() {
  const stars = await getStarCount()

  return (
    <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-2 px-4 sm:px-8">
        <Link href="/" className="mr-1 flex shrink-0 items-center gap-2.5 sm:mr-4">
          <Logo className="size-7" />
          <span className="font-semibold tracking-tight whitespace-nowrap max-[379px]:sr-only">creative-ui</span>
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
          <GithubLink stars={stars} />
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
