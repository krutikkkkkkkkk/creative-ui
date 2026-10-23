import { getSummaries } from "@/lib/registry"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

export default async function DocsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const items = await getSummaries()

  return (
    <SidebarProvider>
      <AppSidebar items={items} />
      <SidebarInset>
        <SiteHeader items={items} />
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
