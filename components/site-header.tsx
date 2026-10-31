"use client"

import Link from "next/link"

import type { ItemSummary } from "@/lib/registry"
import type { UiStyle } from "@/lib/ui-style"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { GithubLink } from "@/components/github-link"
import { StyleToggle } from "@/components/style-toggle"
import { ThemeToggle } from "@/components/theme-toggle"
import { VisitorCount } from "@/components/visitor-count"
import { useSitePathname } from "@/hooks/use-site-pathname"

export function SiteHeader({ items, stars, style }: { items: ItemSummary[]; stars: number | null; style: UiStyle }) {
  const pathname = useSitePathname()
  const name = pathname.startsWith("/docs/") ? pathname.split("/")[2] : null
  const item = name ? items.find((i) => i.name === name) : null

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 rounded-t-xl border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/" className="whitespace-nowrap">
                creative-ui
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            {item ? (
              <BreadcrumbLink asChild>
                <Link href="/docs">Docs</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>Docs</BreadcrumbPage>
            )}
          </BreadcrumbItem>
          {item && (
            <>
              <BreadcrumbSeparator className="hidden sm:block" />
              <BreadcrumbItem className="hidden sm:block">
                {item.kind === "skill" ? "Skills" : "Components"}
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem className="min-w-0">
                <BreadcrumbPage className="truncate">{item.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center gap-1">
        <VisitorCount className="mr-1 max-sm:hidden" />
        <GithubLink stars={stars} />
        <StyleToggle style={style} className="mx-1" />
        <ThemeToggle />
      </div>
    </header>
  )
}
