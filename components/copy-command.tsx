"use client"

import * as React from "react"

export function CopyCommand({ command }: { command: string }) {
  const [copied, setCopied] = React.useState(false)
  return (
    <button
      type="button"
      onClick={() => {
        navigator.clipboard.writeText(command)
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      }}
      className="text-left font-mono text-xs bg-muted rounded-md px-3 py-2 overflow-x-auto whitespace-nowrap hover:bg-muted/70"
      title="Copy"
    >
      {copied ? "Copied!" : command}
    </button>
  )
}
