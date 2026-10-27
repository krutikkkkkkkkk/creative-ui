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
// autocrlf off: copy the files exactly as committed, whatever this machine's git config is.
execFileSync("git", ["clone", "-c", "core.autocrlf=false", "--depth", "1", repoUrl, tmp], { stdio: "inherit" })

const skillMd = fs.readFileSync(path.join(tmp, "SKILL.md"), "utf8")
// \r? because skill repos authored on Windows have CRLF line endings.
const front = skillMd.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? ""
const field = (k) => front.match(new RegExp(`^${k}:\\s*(.+)$`, "m"))?.[1]?.trim()
const name = nameArg ?? field("name") ?? path.basename(repoUrl, ".git")
const description = field("description") ?? `Claude skill: ${name}`

const dest = path.join("registry", "skills", name)
fs.rmSync(dest, { recursive: true, force: true })

// Code in a skill is reference material, but it lands inside the user's project and can import
// packages they don't have. The header keeps type-checking and lint off it where it sits.
const CODE = /\.[cm]?[jt]sx?$/
const HEADER = [
  // eslint-disable first, or lint reports the @ts-nocheck below it (ban-ts-comment).
  "/* eslint-disable */",
  "// @ts-nocheck",
  "// Reference file from a Claude skill: type-checking and lint are off so it can't break your project.",
  "// If you copy it into your app, install the packages it imports and delete these four lines.",
  "",
].join("\n")
const IMPORT = /(?:from|import)\s*\(?\s*["']([^"'./][^"']*)["']|require\(\s*["']([^"'./][^"']*)["']/g
const BUILTIN = new Set(["react", "react-dom"])
const imports = new Set()

const files = []
function walk(dir, rel = "") {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP.has(entry.name)) continue
    const from = path.join(dir, entry.name)
    const r = rel ? `${rel}/${entry.name}` : entry.name
    if (entry.isDirectory()) walk(from, r)
    else {
      fs.mkdirSync(path.dirname(path.join(dest, r)), { recursive: true })
      if (CODE.test(entry.name)) {
        const code = fs.readFileSync(from, "utf8")
        for (const m of code.matchAll(IMPORT)) {
          const spec = m[1] ?? m[2]
          const pkg = spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]
          if (!BUILTIN.has(pkg) && !spec.startsWith("node:")) imports.add(pkg)
        }
        const header = code.includes("\r\n") ? HEADER.replace(/\n/g, "\r\n") : HEADER
        fs.writeFileSync(path.join(dest, r), code.startsWith(header) ? code : header + code)
      } else {
        fs.copyFileSync(from, path.join(dest, r))
      }
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
  // Printed by the shadcn CLI after install, so users know what the reference code expects.
  ...(imports.size && {
    docs: `This skill includes reference code that imports ${[...imports].sort().join(", ")}. Those files have type-checking and lint turned off, so they won't break your project. To use one in your app, install its packages and delete the header at the top of the file.`,
  }),
  files: files.map((f) => ({
    path: `registry/skills/${name}/${f}`,
    type: "registry:file",
    target: `~/.claude/skills/${name}/${f}`,
  })),
}

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"))
const i = registry.items.findIndex((x) => x.name === name)
// Keep the original publish date when re-syncing; a new skill is dated today.
item.meta = { ...registry.items[i]?.meta, addedAt: registry.items[i]?.meta?.addedAt ?? new Date().toISOString().slice(0, 10) }
if (i >= 0) registry.items[i] = item
else registry.items.push(item)
fs.writeFileSync("registry.json", JSON.stringify(registry, null, 2) + "\n")
console.log(`Synced ${files.length} files for "${name}". Run: npm run registry:build`)
