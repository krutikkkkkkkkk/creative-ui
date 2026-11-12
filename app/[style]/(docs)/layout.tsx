import { getStarCount } from "@/lib/github"
import { getSummaries } from "@/lib/registry"
import { styleOf, type StyleParams } from "@/lib/ui-style"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

/* The shell only: sidebar and header. Each page lays itself out with DocFrame (components/docs-prose),
   which owns the content column and the right rail. */
export default async function DocsLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: StyleParams }>) {
  const style = await styleOf(params)
  const [items, stars] = await Promise.all([getSummaries(style), getStarCount()])

  return (
    <SidebarProvider>
      <AppSidebar items={items} />
      <SidebarInset>
        <SiteHeader items={items} stars={stars} style={style} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
