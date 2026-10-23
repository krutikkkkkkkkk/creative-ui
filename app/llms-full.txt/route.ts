import { getItems, SITE_URL } from "@/lib/registry"
import { itemMarkdown } from "@/lib/docs/markdown"
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo"

export const dynamic = "force-static"

/** Every item page as Markdown in one file, for loading the whole registry into an LLM. */
export async function GET() {
  const items = await getItems()
  const pages = await Promise.all(items.map(itemMarkdown))
  const head = `# ${SITE_NAME}\n\n> ${SITE_DESCRIPTION}\n\nIndex: ${SITE_URL}/llms.txt\n`

  return new Response([head, ...pages].join("\n---\n\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
