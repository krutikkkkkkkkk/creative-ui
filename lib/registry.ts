import "server-only"

import { promises as fs } from "fs"
import path from "path"

export const SITE_URL = "https://ui.krutikraut.com"
export const GITHUB_URL = "https://github.com/krutikkkkkkkkk/creative-ui"
export const NAMESPACE = "@creative-ui"
/* creative-ui is run under Infinity Linkage. */
export const COMPANY_NAME = "Infinity Linkage"
export const COMPANY_URL = "https://www.infinitylinkage.com"

export type RegistryFile = { path: string; type: string; target?: string }

export type RegistryItem = {
  name: string
  type: string
  title?: string
  description?: string
  dependencies?: string[]
  registryDependencies?: string[]
  /** Printed by the shadcn CLI after install. */
  docs?: string
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
  poster: string | null
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
      poster: await posterOf(item.name),
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

/** `@creative-ui/<name>`. Resolves with no config because the namespace is in the shadcn registry directory. */
export function installName(name: string) {
  return `${NAMESPACE}/${name}`
}

/** Full JSON URL, for shadcn CLI versions that don't know the namespace. */
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
  return publicFile(`/banners/${name}.png`)
}

/**
 * The still on an item's card: `public/posters/<name>.webp`, captured from its live preview.
 * Falls back to the banner, so skills keep their artwork.
 */
export async function posterOf(name: string) {
  return (await publicFile(`/posters/${name}.webp`)) ?? bannerOf(name)
}

async function publicFile(rel: string) {
  try {
    await fs.access(path.join(process.cwd(), "public", rel))
    return rel
  } catch {
    return null
  }
}
