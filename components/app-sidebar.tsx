"use client"

import * as React from "react"
import Link from "next/link"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiMagicIcon,
  ArrowUpRight01Icon,
  BookOpen01Icon,
  CommandLineIcon,
  GithubIcon,
  Home01Icon,
  McpServerIcon,
  PaintBoardIcon,
  PuzzleIcon,
  Search01Icon,
  Wrench01Icon,
  ZapIcon,
} from "@hugeicons/core-free-icons"

import type { ItemSummary } from "@/lib/registry"
import { Logo } from "@/components/logo"
import { Kbd } from "@/components/ui/kbd"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  useSidebar,
} from "@/components/ui/sidebar"
import { useSitePathname } from "@/hooks/use-site-pathname"

const GET_STARTED = [
  { href: "/docs", label: "Introduction", icon: Home01Icon },
  { href: "/docs/installation/next", label: "Install Next.js", icon: ZapIcon },
  { href: "/docs/installation/tailwind", label: "Install Tailwind CSS", icon: PaintBoardIcon },
  { href: "/docs/installation/utilities", label: "Add utilities", icon: Wrench01Icon },
  { href: "/docs/installation/cli", label: "CLI", icon: CommandLineIcon },
  { href: "/docs/installation/mcp", label: "MCP Server", icon: McpServerIcon },
] as const

export function AppSidebar({
  items,
  ...props
}: { items: ItemSummary[] } & React.ComponentProps<typeof Sidebar>) {
  const pathname = useSitePathname()
  const { setOpenMobile } = useSidebar()
  const [query, setQuery] = React.useState("")
  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest("input, textarea, [contenteditable]")
      if (e.key === "/" && !typing) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const q = query.trim().toLowerCase()
  const filtered = q
    ? items.filter((i) => `${i.title} ${i.name} ${i.description}`.toLowerCase().includes(q))
    : items
  const skills = filtered.filter((i) => i.kind === "skill")
  const components = filtered.filter((i) => i.kind === "component")
  const close = () => setOpenMobile(false)

  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader className="gap-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" onClick={close}>
                <Logo />
                <div className="grid flex-1 text-left leading-tight">
                  <span className="truncate font-semibold tracking-tight">creative-ui</span>
                  <span className="truncate text-xs text-muted-foreground">by Krutik Raut</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <div className="relative">
          <HugeiconsIcon
            icon={Search01Icon}
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            strokeWidth={2}
          />
          <SidebarInput
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search registry"
            aria-label="Search registry"
            className="h-9 pr-8 pl-8"
          />
          <Kbd className="absolute top-1/2 right-2 -translate-y-1/2">/</Kbd>
        </div>
      </SidebarHeader>

      <SidebarContent className="no-scrollbar">
        {!q && (
          <SidebarGroup>
            <SidebarGroupLabel>Get started</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {GET_STARTED.map((entry) => (
                  <SidebarMenuItem key={entry.href}>
                    <SidebarMenuButton asChild isActive={pathname === entry.href} tooltip={entry.label}>
                      <Link href={entry.href} onClick={close}>
                        <HugeiconsIcon icon={entry.icon} strokeWidth={2} />
                        <span>{entry.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <NavGroup label="Skills" icon={AiMagicIcon} items={skills} pathname={pathname} onNavigate={close} />
        <NavGroup label="Components" icon={PuzzleIcon} items={components} pathname={pathname} onNavigate={close} />

        {q && filtered.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Nothing matches “{query}”.
          </p>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="https://ui.shadcn.com/docs/registry" target="_blank" rel="noreferrer">
                <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={2} />
                <span>shadcn registry docs</span>
                <HugeiconsIcon icon={ArrowUpRight01Icon} className="ml-auto opacity-50" strokeWidth={2} />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <a href="https://github.com/krutikkkkkkkkk/creative-ui" target="_blank" rel="noreferrer">
                <HugeiconsIcon icon={GithubIcon} strokeWidth={2} />
                <span>GitHub</span>
                <HugeiconsIcon icon={ArrowUpRight01Icon} className="ml-auto opacity-50" strokeWidth={2} />
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function NavGroup({
  label,
  icon,
  items,
  pathname,
  onNavigate,
}: {
  label: string
  icon: React.ComponentProps<typeof HugeiconsIcon>["icon"]
  items: ItemSummary[]
  pathname: string
  onNavigate: () => void
}) {
  if (items.length === 0) return null
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => {
            const href = `/docs/${item.name}`
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === href}
                  tooltip={item.title}
                  className={item.fileCount > 1 ? "pr-9" : undefined}
                >
                  <Link href={href} onClick={onNavigate}>
                    <HugeiconsIcon icon={icon} strokeWidth={2} />
                    <span className="truncate">{item.title}</span>
                    {item.isNew && (
                      <span className="-ml-0.5 size-1.5 shrink-0 rounded-full bg-brand" title="New">
                        <span className="sr-only">New</span>
                      </span>
                    )}
                  </Link>
                </SidebarMenuButton>
                {item.fileCount > 1 && (
                  <SidebarMenuBadge className="font-mono text-[10px] text-muted-foreground">
                    {item.fileCount}
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
