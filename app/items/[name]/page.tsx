import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  AiMagicIcon,
  CodeIcon,
  FileScriptIcon,
  Folder01Icon,
  LinkSquare02Icon,
  PackageIcon,
  PuzzleIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons"

import {
  displayTitle,
  getItem,
  getItems,
  installUrl,
  kindOf,
  NAMESPACE,
  readItemFile,
  skillIntro,
  type RegistryFile,
} from "@/lib/registry"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeBlock } from "@/components/code-block"
import { InstallCommand } from "@/components/copy-command"
import { OpenInV0Button } from "@/components/open-in-v0-button"
import { previews } from "@/components/previews"

type Props = { params: Promise<{ name: string }> }

export async function generateStaticParams() {
  return (await getItems()).map((i) => ({ name: i.name }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const item = await getItem((await params).name)
  if (!item) return {}
  return { title: displayTitle(item), description: item.description }
}

export default async function ItemPage({ params }: Props) {
  const { name } = await params
  const item = await getItem(name)
  if (!item) notFound()

  const kind = kindOf(item)
  const isSkill = kind === "skill"
  const files = item.files ?? []
  const Preview = previews[item.name]

  const contents = await Promise.all(files.map(async (f) => ({ file: f, code: await readItemFile(f.path) })))
  const skillMd = isSkill ? contents.find((c) => c.file.path.endsWith("/SKILL.md"))?.code : null
  const intro = skillMd ? skillIntro(skillMd) : null

  return (
    <div className="mx-auto w-full max-w-4xl px-4 pt-10 pb-24 sm:px-8">
      {/* Title */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="gap-1 font-normal">
            <HugeiconsIcon icon={isSkill ? AiMagicIcon : PuzzleIcon} className="size-3" strokeWidth={2} />
            {isSkill ? "Claude skill" : "Component"}
          </Badge>
          <Badge variant="outline" className="font-mono font-normal text-muted-foreground">
            {item.type}
          </Badge>
        </div>
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">{displayTitle(item)}</h1>
        {item.description && (
          <p className="max-w-2xl text-base leading-relaxed text-pretty text-muted-foreground">
            {isSkill ? (intro ?? item.description) : item.description}
          </p>
        )}
        <div className="flex flex-wrap gap-2 pt-1">
          {!isSkill && <OpenInV0Button name={item.name} className="h-8" />}
          <Button variant="outline" size="sm" asChild>
            <a href={`/r/${item.name}.json`} target="_blank" rel="noreferrer">
              <HugeiconsIcon icon={LinkSquare02Icon} strokeWidth={2} />
              Registry JSON
            </a>
          </Button>
        </div>
      </div>

      {/* Install */}
      <Section title="Installation">
        <InstallCommand target={installUrl(item.name)} />
        <p className="mt-3 text-sm text-muted-foreground">
          With the namespace set up:{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
            npx shadcn@latest add {NAMESPACE}/{item.name}
          </code>
          {isSkill && (
            <>
              . Files go into{" "}
              <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">.claude/skills/{item.name}/</code>
            </>
          )}
        </p>
      </Section>

      {/* Preview / code for components */}
      {!isSkill && (
        <Section title="Preview">
          <Tabs defaultValue={Preview ? "preview" : "code"} className="gap-3">
            <TabsList>
              {Preview && (
                <TabsTrigger value="preview">
                  <HugeiconsIcon icon={ViewIcon} strokeWidth={2} />
                  Preview
                </TabsTrigger>
              )}
              <TabsTrigger value="code">
                <HugeiconsIcon icon={CodeIcon} strokeWidth={2} />
                Code
              </TabsTrigger>
            </TabsList>
            {Preview && (
              <TabsContent value="preview">
                <div className="grid min-h-80 place-items-center rounded-xl border bg-[radial-gradient(var(--border)_1px,transparent_1px)] [background-size:16px_16px] p-8">
                  <Preview />
                </div>
              </TabsContent>
            )}
            <TabsContent value="code" className="flex flex-col gap-4">
              {contents.map(({ file, code }) =>
                code ? <CodeBlock key={file.path} code={code} title={fileLabel(file)} /> : null
              )}
            </TabsContent>
          </Tabs>
        </Section>
      )}

      {/* Skill contents */}
      {isSkill && (
        <>
          <Section title="What gets installed" aside={`${files.length} files`}>
            <FileTree files={files} root={item.name} />
          </Section>
          {skillMd && (
            <Section title="SKILL.md">
              <CodeBlock code={skillMd} title={`.claude/skills/${item.name}/SKILL.md`} maxHeight="36rem" wrap />
            </Section>
          )}
        </>
      )}

      {/* Dependencies */}
      {Boolean(item.dependencies?.length || item.registryDependencies?.length) && (
        <Section title="Dependencies">
          <div className="flex flex-wrap gap-2">
            {item.dependencies?.map((d) => (
              <Badge key={d} variant="outline" className="gap-1 font-mono font-normal">
                <HugeiconsIcon icon={PackageIcon} className="size-3" strokeWidth={2} />
                {d}
              </Badge>
            ))}
            {item.registryDependencies?.map((d) => (
              <Badge key={d} variant="secondary" className="gap-1 font-mono font-normal">
                <HugeiconsIcon icon={PuzzleIcon} className="size-3" strokeWidth={2} />
                shadcn/{d}
              </Badge>
            ))}
          </div>
        </Section>
      )}
    </div>
  )
}

function fileLabel(file: RegistryFile) {
  return file.target?.replace(/^~\//, "") ?? file.path.split("/").pop() ?? file.path
}

function Section({ title, aside, children }: { title: string; aside?: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <div className="mb-4 flex items-baseline justify-between border-b pb-2">
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {aside && <span className="font-mono text-xs text-muted-foreground">{aside}</span>}
      </div>
      {children}
    </section>
  )
}

/** Groups a skill's files by folder, relative to .claude/skills/<root>/. */
function FileTree({ files, root }: { files: RegistryFile[]; root: string }) {
  const prefix = `~/.claude/skills/${root}/`
  const rel = files.map((f) => (f.target ?? f.path).replace(prefix, ""))
  const groups = new Map<string, string[]>()
  for (const r of rel) {
    const dir = r.includes("/") ? r.slice(0, r.lastIndexOf("/")) : ""
    groups.set(dir, [...(groups.get(dir) ?? []), r.slice(r.lastIndexOf("/") + 1)])
  }
  const dirs = [...groups.keys()].sort((a, b) => (a === "" ? -1 : b === "" ? 1 : a.localeCompare(b)))

  return (
    <div className="grid items-start gap-3 sm:grid-cols-2">
      {dirs.map((dir) => (
        <div key={dir || "root"} className="rounded-xl border bg-card p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <HugeiconsIcon icon={Folder01Icon} className="size-4 text-amber-500" strokeWidth={2} />
            <span className="font-mono">{dir ? `${dir}/` : `${root}/`}</span>
            <span className="ml-auto font-mono text-xs font-normal text-muted-foreground">
              {groups.get(dir)!.length}
            </span>
          </div>
          <ul className="space-y-1.5">
            {groups.get(dir)!.map((f) => (
              <li key={f} className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
                <HugeiconsIcon icon={FileScriptIcon} className="size-3.5 shrink-0" strokeWidth={1.75} />
                <span className="truncate">{f}</span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
