"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { Copy01Icon, Tick02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"

/** Copies the page as Markdown (from /docs/<name>/llms.txt) for pasting into an LLM. */
export function CopyForLlmButton({ name, className }: { name: string; className?: string }) {
  const [state, setState] = React.useState<"idle" | "copying" | "copied" | "error">("idle")

  async function copy() {
    setState("copying")
    const text = fetch(`/docs/${name}/llms.txt`).then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`)
      return r.text()
    })
    try {
      // Passing the pending blob keeps Safari's user-gesture window open during the fetch.
      if (typeof ClipboardItem !== "undefined" && navigator.clipboard.write) {
        const blob = text.then((t) => new Blob([t], { type: "text/plain" }))
        await navigator.clipboard.write([new ClipboardItem({ "text/plain": blob })])
      } else {
        await navigator.clipboard.writeText(await text)
      }
      setState("copied")
    } catch {
      setState("error")
    }
    setTimeout(() => setState("idle"), 1500)
  }

  return (
    <Button type="button" variant="outline" size="sm" className={className} onClick={copy} disabled={state === "copying"}>
      <HugeiconsIcon icon={state === "copied" ? Tick02Icon : Copy01Icon} strokeWidth={2} />
      {state === "copied" ? "Copied" : state === "error" ? "Copy failed" : "Copy for LLM"}
    </Button>
  )
}
