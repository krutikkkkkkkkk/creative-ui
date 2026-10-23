import { getItem, getItems } from "@/lib/registry"
import { itemMarkdown } from "@/lib/docs/markdown"

export const dynamic = "force-static"

export async function generateStaticParams() {
  return (await getItems()).map((i) => ({ name: i.name }))
}

export async function GET(_req: Request, { params }: { params: Promise<{ name: string }> }) {
  const item = await getItem((await params).name)
  if (!item) return new Response("Not found", { status: 404 })

  return new Response(await itemMarkdown(item), {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  })
}
