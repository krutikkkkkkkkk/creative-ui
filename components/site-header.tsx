"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import { GithubIcon } from "@hugeicons/core-free-icons"

import type { ItemSummary } from "@/lib/registry"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader({ items }: { items: ItemSummary[] }) {
  const pathname = usePathname()
  const name = pathname.startsWith("/items/") ? pathname.split("/")[2] : null
  const item = name ? items.find((i) => i.name === name) : null

  return (
    <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 rounded-t-xl border-b bg-background/80 px-4 backdrop-blur">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
      <Breadcrumb className="min-w-0 flex-1">
        <BreadcrumbList className="flex-nowrap">
          <BreadcrumbItem>
            {item ? (
              <BreadcrumbLink asChild>
                <Link href="/">creative-ui</Link>
              </BreadcrumbLink>
            ) : (
              <BreadcrumbPage>creative-ui</BreadcrumbPage>
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
        <Button variant="ghost" size="icon" className="size-8" asChild>
          <a href="https://github.com/krutikkkkkkkkk/creative-ui" target="_blank" rel="noreferrer" aria-label="GitHub">
            <HugeiconsIcon icon={GithubIcon} className="size-4" strokeWidth={2} />
          </a>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}
