import { HomeHeader } from "@/components/home-header"
import { SiteFooter } from "@/components/site-footer"

export default function HomeLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-svh flex-col">
      <HomeHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
