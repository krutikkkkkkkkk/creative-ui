import "server-only"

import { promises as fs } from "fs"
import path from "path"

export const SITE_URL = "https://ui.krutikraut.com"
export const GITHUB_URL = "https://github.com/krutikkkkkkkkk/creative-ui"
export const NAMESPACE = "@creative-ui"

export type RegistryFile = { path: string; type: string; target?: string }

export type RegistryItem = {
  name: string
  type: string
  title?: string
  description?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files?: RegistryFile[]
}

export type ItemKind = "component" | "skill"

export type ItemSummary = {
  name: string
  title: string
  description: string
  kind: ItemKind
  fileCount: number
  banner: string | null
}

async function readRegistry(): Promise<{ items: RegistryItem[] }> {
  const file = await fs.readFile(path.join(process.cwd(), "registry.json"), "utf8")
  return JSON.parse(file)
}

export function kindOf(item: RegistryItem): ItemKind {
  const isSkill = item.files?.some((f) => f.target?.includes(".claude/skills/"))
  return isSkill ? "skill" : "component"
}

export function displayTitle(item: RegistryItem) {
  return (item.title ?? item.name).replace(/\s*\(Claude skill\)\s*$/i, "")
}

export async function getItems(): Promise<RegistryItem[]> {
  return (await readRegistry()).items ?? []
}

export async function getSummaries(): Promise<ItemSummary[]> {
  const items = await getItems()
  return Promise.all(
    items.map(async (item) => ({
      name: item.name,
      title: displayTitle(item),
      description: item.description ?? "",
      kind: kindOf(item),
      fileCount: item.files?.length ?? 0,
      banner: await bannerOf(item.name),
    }))
  )
}

export async function getItem(name: string) {
  const items = await getItems()
  return items.find((i) => i.name === name) ?? null
}

export async function readItemFile(filePath: string) {
  try {
    return await fs.readFile(path.join(process.cwd(), filePath), "utf8")
  } catch {
    return null
  }
}

export function installUrl(name: string) {
  return `${SITE_URL}/r/${name}.json`
}

/** First paragraph of a skill's SKILL.md body (after frontmatter and title). */
export function skillIntro(skillMd: string) {
  const body = skillMd.replace(/^---[\s\S]*?---\s*/, "")
  const paragraphs = body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith("#") && !p.startsWith("|") && !p.startsWith("---"))
  return paragraphs[0]?.replace(/\*\*/g, "") ?? ""
}

/**
 * Optional hero banner for an item: drop a `public/banners/<name>.png` and it
 * appears on the item page and as its social preview image.
 */
export async function bannerOf(name: string) {
  const rel = `/banners/${name}.png`
  try {
    await fs.access(path.join(process.cwd(), "public", rel))
    return rel
  } catch {
    return null
  }
}
