// Gives every registry item a publish date, so the sidebar can mark new pieces.
// Runs before `shadcn build`: an item without `meta.addedAt` is stamped with today's date.
import fs from "node:fs"

const registry = JSON.parse(fs.readFileSync("registry.json", "utf8"))
const today = new Date().toISOString().slice(0, 10)
const stamped = []

registry.items = registry.items.map((item) => {
  if (item.meta?.addedAt) return item
  stamped.push(item.name)
  const { files, ...rest } = item
  return { ...rest, meta: { ...item.meta, addedAt: today }, files }
})

if (stamped.length) {
  fs.writeFileSync("registry.json", JSON.stringify(registry, null, 2) + "\n")
  console.log(`Stamped ${stamped.join(", ")} as added ${today}. Commit registry.json.`)
}
