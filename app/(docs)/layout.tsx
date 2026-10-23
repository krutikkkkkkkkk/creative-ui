import { getStarCount } from "@/lib/github"
import { getSummaries } from "@/lib/registry"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SponsorsCard } from "@/components/sponsors-card"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function DocsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [items, stars] = await Promise.all([getSummaries(), getStarCount()])

  return (
    <SidebarProvider>
      <AppSidebar items={items} />
      <SidebarInset>
        <SiteHeader items={items} stars={stars} />
        <div className="flex flex-1">
          <div className="min-w-0 flex-1">{children}</div>
          <aside className="hidden w-64 shrink-0 pt-10 pr-6 xl:block">
            <SponsorsCard className="sticky top-20" />
          </aside>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
