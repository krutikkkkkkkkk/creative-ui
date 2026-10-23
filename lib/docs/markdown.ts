import { displayTitle, installName, installUrl, kindOf, readItemFile, SITE_URL, type RegistryItem } from "@/lib/registry"
import { docs as allDocs } from "@/lib/docs"

/**
 * The item page as one Markdown document for pasting into an LLM:
 * install command, usage, props, notes and the full source of every file.
 * Served at /docs/<name>/llms.txt and copied by the "Copy for LLM" button.
 */
export async function itemMarkdown(item: RegistryItem) {
  const isSkill = kindOf(item) === "skill"
  const docs = isSkill ? undefined : allDocs[item.name]
  const out: string[] = []

  out.push(`# ${displayTitle(item)}`)
  if (item.description) out.push(item.description)
  out.push(`${isSkill ? "Claude skill" : "React component"} from Creative UI. Docs: ${SITE_URL}/docs/${item.name}`)

  out.push("## Installation")
  out.push(fence(`npx shadcn@latest add ${installName(item.name)}`, "bash"))
  out.push(`On an older shadcn CLI, use the URL: \`npx shadcn@latest add ${installUrl(item.name)}\``)
  if (isSkill) out.push(`Files go into \`.claude/skills/${item.name}/\`.`)
  if (item.docs) out.push(item.docs)

  if (item.dependencies?.length || item.registryDependencies?.length) {
    out.push("## Dependencies")
    out.push(
      [
        ...(item.dependencies ?? []).map((d) => `- \`${d}\` (npm)`),
        ...(item.registryDependencies ?? []).map((d) => `- \`${d}\` (shadcn)`),
      ].join("\n")
    )
  }

  if (docs) {
    out.push("## Usage")
    out.push(fence(docs.usage, "tsx"))

    out.push("## Props")
    for (const api of docs.api) {
      if (docs.api.length > 1) out.push(`### ${api.name}`)
      if (api.description) out.push(api.description)
      out.push(
        [
          "| Prop | Type | Default | Description |",
          "| --- | --- | --- | --- |",
          ...api.props.map(
            (p) =>
              `| \`${p.name}\`${p.required ? " (required)" : ""} | \`${cell(p.type)}\` | ${p.default ? `\`${cell(p.default)}\`` : "-"} | ${cell(p.description)} |`
          ),
        ].join("\n")
      )
      if (api.extends) out.push(`Also accepts all native \`<${api.extends}>\` props.`)
    }

    if (docs.exports?.length) {
      out.push("## Also exported")
      out.push(docs.exports.map((e) => `- \`${e.signature}\`: ${e.description}`).join("\n"))
    }

    if (docs.notes?.length) {
      out.push("## Notes")
      out.push(docs.notes.map((n) => `- ${n}`).join("\n"))
    }
  }

  const files = item.files ?? []
  if (files.length) {
    out.push(isSkill ? "## Skill files" : "## Source")
    for (const file of files) {
      const code = await readItemFile(file.path)
      if (code == null) continue
      const label = file.target?.replace(/^~\//, "") ?? file.path
      out.push(`### ${label}`)
      out.push(fence(code, file.path.split(".").pop()))
    }
  }

  return out.join("\n\n") + "\n"
}

/** Fenced block that survives backticks inside the code (e.g. Markdown files). */
function fence(code: string, lang = "") {
  const longest = Math.max(2, ...(code.match(/`+/g) ?? []).map((m) => m.length))
  const ticks = "`".repeat(longest + 1)
  return `${ticks}${lang}\n${code.trimEnd()}\n${ticks}`
}

function cell(text: string) {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ")
}
