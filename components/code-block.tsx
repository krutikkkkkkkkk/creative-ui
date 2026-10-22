import { HugeiconsIcon } from "@hugeicons/react"
import { File01Icon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { CopyButton } from "@/components/copy-command"

export function CodeBlock({
  code,
  title,
  className,
  maxHeight = "28rem",
  wrap = false,
}: {
  code: string
  title?: string
  className?: string
  maxHeight?: string
  wrap?: boolean
}) {
  return (
    <div className={cn("min-w-0 overflow-hidden rounded-xl border bg-muted/40", className)}>
      {title && (
        <div className="flex items-center gap-2 border-b px-4 py-2">
          <HugeiconsIcon icon={File01Icon} className="size-3.5 text-muted-foreground" strokeWidth={2} />
          <span className="flex-1 truncate font-mono text-xs text-muted-foreground">{title}</span>
          <CopyButton value={code} label="Copy code" />
        </div>
      )}
      <pre
        className={cn("overflow-auto p-4 font-mono text-[13px] leading-relaxed", wrap && "break-words whitespace-pre-wrap")} style={{ maxHeight }}>
        <code>{code}</code>
      </pre>
    </div>
  )
}
