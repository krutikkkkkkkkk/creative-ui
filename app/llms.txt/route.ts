import { getSummaries, GITHUB_URL, installName, SITE_URL, type ItemSummary } from "@/lib/registry"
import { DOCS_PAGES, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo"

export const dynamic = "force-static"

/**
 * The site index for LLMs, following llmstxt.org: a summary, then links to the
 * Markdown version of every item page (install, usage, props and full source).
 */
export async function GET() {
  const items = await getSummaries()
  const link = (i: ItemSummary) => `- [${i.title}](${SITE_URL}/docs/${i.name}/llms.txt): ${i.description}`
  const components = items.filter((i) => i.kind === "component")
  const skills = items.filter((i) => i.kind === "skill")

  const out = [
    `# ${SITE_NAME}`,
    `> ${SITE_DESCRIPTION}`,
    [
      `${SITE_NAME} is a shadcn registry. Nothing is installed as a package: the shadcn CLI copies the source into the project, so the user owns every file.`,
      "",
      `- Install an item: \`npx shadcn@latest add ${installName("<name>")}\`. The namespace is in the shadcn registry directory, so it needs no config.`,
      `- On an older shadcn CLI, install from the JSON URL: \`npx shadcn@latest add ${SITE_URL}/r/<name>.json\`.`,
      "- Components are React + Tailwind CSS v4 and import `cn` from `@/lib/utils`.",
      "- Claude skills install into `.claude/skills/<name>/`.",
    ].join("\n"),
    "## Docs",
    DOCS_PAGES.map((p) => `- [${p.title}](${SITE_URL}${p.path}): ${p.description}`).join("\n"),
  ]
  if (components.length) out.push("## Components", components.map(link).join("\n"))
  if (skills.length) out.push("## Claude skills", skills.map(link).join("\n"))
  out.push(
    "## Optional",
    [
      `- [Full docs](${SITE_URL}/llms-full.txt): every item page above in one Markdown file`,
      `- [Registry index](${SITE_URL}/r/registry.json): the shadcn registry JSON`,
      `- [Source on GitHub](${GITHUB_URL})`,
      `- [License](${SITE_URL}/license): MIT`,
    ].join("\n")
  )

  return new Response(out.join("\n\n") + "\n", {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  })
}
