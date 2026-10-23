import type { Metadata } from "next"

import { getSummaries, installUrl, NAMESPACE, SITE_URL } from "@/lib/registry"
import { CodeBlock } from "@/components/code-block"
import { InstallCommand } from "@/components/copy-command"
import { Code, DocPage, Note, Pager, Section, Step } from "@/components/docs-prose"

export const metadata: Metadata = {
  title: "CLI",
  description: "Install creative-ui components and Claude skills with the shadcn CLI.",
}

export default async function CliPage() {
  const items = await getSummaries()
  const first = items.find((i) => i.kind === "skill") ?? items[0]
  const name = first?.name ?? "<name>"

  const registriesSnippet = `{
  "registries": {
    "${NAMESPACE}": "${SITE_URL}/r/{name}.json"
  }
}`

  return (
    <DocPage
      title="CLI"
      description="Nothing is installed as a package. The shadcn CLI copies each item's source into your project, so you own every file and can change it freely."
    >
      <Section title="Setup">
        <div className="flex flex-col gap-8">
          <Step
            n="1"
            title="Initialise shadcn"
            body={
              <>
                Creates <Code>components.json</Code>, theme tokens in <Code>globals.css</Code> and{" "}
                <Code>lib/utils.ts</Code>. Skip if your project already has them.
              </>
            }
          >
            <InstallCommand command="shadcn@latest init" />
          </Step>
          <Step n="2" title="Install by URL" body="Works in any project that has shadcn set up. No extra config.">
            <InstallCommand target={installUrl(name)} />
          </Step>
          <Step
            n="3"
            title="Or add the namespace"
            body={
              <>
                Add this to <Code>components.json</Code> once, then install with <Code>{NAMESPACE}/name</Code>.
              </>
            }
          >
            <CodeBlock code={registriesSnippet} title="components.json" />
            <InstallCommand target={`${NAMESPACE}/${name}`} />
          </Step>
        </div>
      </Section>

      <Section title="Where files go">
        <Note>
          Components land in <Code>components/</Code>. Skills land in <Code>.claude/skills/</Code>, where Claude Code
          picks them up automatically. Each item page lists exactly which files it writes.
        </Note>
      </Section>

      <Pager
        prev={{ href: "/docs/installation/utilities", label: "Add utilities" }}
        next={{ href: "/docs/installation/mcp", label: "MCP Server" }}
      />
    </DocPage>
  )
}
