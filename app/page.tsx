import * as React from "react"
import { promises as fs } from "fs"
import path from "path"
import { OpenInV0Button } from "@/components/open-in-v0-button"
import { CopyCommand } from "@/components/copy-command"

// Index of everything in registry.json. New items show up here automatically.
type RegistryItem = { name: string; title?: string; description?: string }

async function getItems(): Promise<RegistryItem[]> {
  const file = await fs.readFile(path.join(process.cwd(), "registry.json"), "utf8")
  return JSON.parse(file).items ?? []
}

export default async function Home() {
  const items = await getItems()
  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-12 gap-10">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">creative-ui</h1>
        <p className="text-muted-foreground">
          Components and blocks by Krutik Raut, installable with the shadcn CLI.
        </p>
        <CopyCommand command="npx shadcn@latest add https://ui.krutikraut.com/r/<name>.json" />
      </header>
      <main className="flex flex-col gap-4">
        {items.map((item) => (
          <div
            key={item.name}
            className="flex flex-col gap-3 border rounded-lg p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex flex-col gap-1 min-w-0">
              <h2 className="font-medium">{item.title}</h2>
              <p className="text-sm text-muted-foreground">{item.description}</p>
              <CopyCommand command={`npx shadcn@latest add https://ui.krutikraut.com/r/${item.name}.json`} />
            </div>
            <OpenInV0Button name={item.name} className="w-fit shrink-0" />
          </div>
        ))}
      </main>
    </div>
  )
}
