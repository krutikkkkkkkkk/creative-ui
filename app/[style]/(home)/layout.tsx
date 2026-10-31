import { HomeHeader } from "@/components/home-header"
import { SiteFooter } from "@/components/site-footer"
import { styleOf, type StyleParams } from "@/lib/ui-style"

export default async function HomeLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: StyleParams }>) {
  const style = await styleOf(params)
  return (
    <div className="flex min-h-svh flex-col">
      <HomeHeader style={style} />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
  )
}
