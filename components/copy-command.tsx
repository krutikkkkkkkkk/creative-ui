"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function CopyButton({
  value,
  className,
  label = "Copy",
}: {
  value: string
  className?: string
  label?: string
}) {
  const [copied, setCopied] = React.useState(false)

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label={copied ? "Copied" : label}
      className={cn("size-7 shrink-0 text-muted-foreground hover:text-foreground", className)}
      onClick={async () => {
        await navigator.clipboard.writeText(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
    >
      <HugeiconsIcon icon={copied ? Tick02Icon : Copy01Icon} className="size-3.5" strokeWidth={2} />
    </Button>
  )
}

const MANAGERS = [
  { id: "pnpm", run: "pnpm dlx" },
  { id: "npm", run: "npx" },
  { id: "yarn", run: "yarn dlx" },
  { id: "bun", run: "bunx --bun" },
] as const

/** Package-manager tabs with a copyable `shadcn add` command. */
export function InstallCommand({ target, className }: { target: string; className?: string }) {
  return (
    <Tabs defaultValue="npm" className={cn("min-w-0 gap-0 overflow-hidden rounded-xl border bg-muted/40", className)}>
      <div className="flex items-center justify-between border-b px-2 py-1.5">
        <TabsList className="h-8 bg-transparent p-0">
          {MANAGERS.map((m) => (
            <TabsTrigger
              key={m.id}
              value={m.id}
              className="h-7 rounded-md px-2.5 font-mono text-xs data-[state=active]:bg-background data-[state=active]:shadow-xs"
            >
              {m.id}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {MANAGERS.map((m) => {
        const cmd = `${m.run} shadcn@latest add ${target}`
        return (
          <TabsContent key={m.id} value={m.id} className="m-0 flex items-center gap-2 px-4 py-3">
            <code className="min-w-0 flex-1 overflow-x-auto font-mono text-[13px] whitespace-nowrap">
              <span className="text-muted-foreground select-none">$ </span>
              {cmd}
            </code>
            <CopyButton value={cmd} label="Copy command" />
          </TabsContent>
        )
      })}
    </Tabs>
  )
}
