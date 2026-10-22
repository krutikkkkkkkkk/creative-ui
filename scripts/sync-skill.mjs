// Pulls a Claude skill from a GitHub repo into registry/skills/<name>
// and writes/updates its registry:item entry in registry.json.
//
// Usage: node scripts/sync-skill.mjs <github-repo-url> [skill-name]
//   e.g. node scripts/sync-skill.mjs https://github.com/krutikkkkkkkkk/classical-collage-web-design
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

const [repoUrl, nameArg] = process.argv.slice(2)
if (!repoUrl) {
  console.error("Usage: node scripts/sync-skill.mjs <github-repo-url> [skill-name]")
  process.exit(1)
}

const SKIP = new Set([".git", ".github", "README.md", "node_modules", ".DS_Store"])
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "skill-"))
execFileSync("git", ["clone", "--depth", "1", repoUrl, tmp], { stdio: "inherit" })

const skillMd = fs.readFileSync(path.join(tmp, "SKILL.md"), "utf8")
const front = skillMd.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ""
const field = (k) => front.match(new RegExp(`^${k}:\\s*(.+)$`, "m"))?.[1]?.trim()
const name = nameArg ?? field("name") ?? path.basename(repoUrl, ".git")
const description = field("description") ?? `Claude skill: ${name}`

const dest = path.join("registry", "skills", name)
fs.rmSync(dest, { recursive: true, force: true })

const files = []
function walk(dir, rel = "") {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const from = path.join(dir, entry.name)
    const r = rel ? `${rel}/${entry.name}` : entry.name
    if (entry.isDirectory()) walk(from, r)
    else {
      fs.mkdirSync(path.dirname(path.join(dest, r)), { recursive: true })
      fs.copyFileSync(from, path.join(dest, r))
      files.push(r)
    }
  }
}
walk(tmp)
fs.rmSync(tmp, { recursive: true, force: true })
files.sort((a, b) => (a === "SKILL.md" ? -1 : b === "SKILL.md" ? 1 : a.localeCompare(b)))

const title = name.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ")
const item = {
  name,
  type: "registry:item",
  title: `${title} (Claude skill)`,
  description,
  files: files.map((f) => ({
    path: `registry/skills/${name}/${f}`,
    type: "registry:file",
    target: `~/.claude/skills/${name}/${f}`,
  })),
}

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"))
const i = registry.items.findIndex((x) => x.name === name)
if (i >= 0) registry.items[i] = item
else registry.items.push(item)
fs.writeFileSync("registry.json", JSON.stringify(registry, null, 2) + "\n")
console.log(`Synced ${files.length} files for "${name}". Run: npm run registry:build`)
