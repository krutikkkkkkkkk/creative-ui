import type { MetadataRoute } from "next"

import { getSummaries, SITE_URL } from "@/lib/registry"
import { DOCS_PAGES, SITE_PAGES } from "@/lib/seo"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const items = await getSummaries()
  const entry = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({
    url: `${SITE_URL}${path === "/" ? "" : path}`,
    changeFrequency: "weekly",
    priority,
  })

  return [
    { ...entry("/", 1), images: [`${SITE_URL}/og.jpg`] },
    ...DOCS_PAGES.map((p) => entry(p.path, p.path === "/docs" ? 0.9 : 0.6)),
    ...items.map((i) => ({
      ...entry(`/docs/${i.name}`, 0.8),
      ...(i.banner && { images: [`${SITE_URL}${i.banner}`] }),
    })),
    ...SITE_PAGES.map((p) => entry(p, p.startsWith("/sponsor") ? 0.5 : 0.3)),
  ]
}
