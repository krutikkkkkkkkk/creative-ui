import type { Metadata } from "next"

import { getSummaries, NAMESPACE, SITE_URL } from "@/lib/registry"
import { CodeBlock } from "@/components/code-block"
import { InstallCommand } from "@/components/copy-command"
import { Code, DocPage, Note, Pager, Section, Step } from "@/components/docs-prose"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export const metadata: Metadata = {
  title: "MCP Server",
  description: "Browse, search and install creative-ui items from your AI assistant with the shadcn MCP server.",
}

const CLIENTS = [
  { id: "claude", label: "Claude Code" },
  { id: "cursor", label: "Cursor" },
  { id: "vscode", label: "VS Code" },
  { id: "codex", label: "Codex" },
  { id: "opencode", label: "OpenCode" },
] as const

export default async function McpPage() {
  const items = await getSummaries()
  const component = items.find((i) => i.kind === "component")
  const skill = items.find((i) => i.kind === "skill")

  const registriesSnippet = `{
  "registries": {
    "${NAMESPACE}": "${SITE_URL}/r/{name}.json"
  }
}`

  const prompts = [
    `Show me everything in the ${NAMESPACE} registry`,
    component && `Add the ${component.title} component from ${NAMESPACE}`,
    skill && `Install the ${skill.title} skill from ${NAMESPACE}`,
    `Find a ${NAMESPACE} component for image effects and add it to the hero`,
  ].filter(Boolean) as string[]

  return (
    <DocPage
      title="MCP Server"
      description="The shadcn MCP server lets AI assistants work with registry items. Browse what's available, search for something specific and install it into your project in plain language."
    >
      <Section title="Setup">
        <div className="flex flex-col gap-8">
          <Step
            n="1"
            title="Add the registry"
            body={
              <>
                Add the creative-ui namespace to your project&apos;s <Code>components.json</Code>. This is the same entry
                the CLI page uses, so skip it if you already have it.
              </>
            }
          >
            <CodeBlock code={registriesSnippet} title="components.json" />
          </Step>
          <Step n="2" title="Add the MCP server" body="Run this in your project root and pick your assistant when asked.">
            <InstallCommand command="shadcn@latest mcp init" />
          </Step>
          <Step
            n="3"
            title="Or set up a specific client"
            body="Skip the prompt by naming the client. Restart the assistant afterwards so it loads the server."
          >
            <Tabs defaultValue="claude" className="min-w-0 gap-3">
              <TabsList className="h-8 w-fit max-w-full justify-start overflow-x-auto">
                {CLIENTS.map((c) => (
                  <TabsTrigger key={c.id} value={c.id} className="h-7 px-2.5 text-xs">
                    {c.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {CLIENTS.map((c) => (
                <TabsContent key={c.id} value={c.id} className="m-0">
                  <InstallCommand command={`shadcn@latest mcp init --client ${c.id}`} />
                </TabsContent>
              ))}
            </Tabs>
          </Step>
        </div>
      </Section>

      <Section title="Try it">
        <Note className="mb-4 text-sm text-muted-foreground">
          Once the server is connected, ask your assistant things like:
        </Note>
        <ul className="flex flex-col gap-2">
          {prompts.map((p) => (
            <li key={p} className="rounded-lg border bg-muted/40 px-4 py-2.5 font-mono text-[13px]">
              {p}
            </li>
          ))}
        </ul>
        <Note className="mt-6 text-sm text-muted-foreground">
          Installs go through the same CLI, so files land where they always do. Components go to{" "}
          <Code>components/</Code> and skills go to <Code>.claude/skills/</Code>.
        </Note>
      </Section>

      <Pager
        prev={{ href: "/docs/installation/cli", label: "CLI" }}
        next={{ href: "/docs", label: "Browse the registry" }}
      />
    </DocPage>
  )
}
