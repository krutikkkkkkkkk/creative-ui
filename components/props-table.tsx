import type { ComponentApi } from "@/lib/docs"
import { cn } from "@/lib/utils"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

/** Renders `backticks` in doc strings as inline code. */
export function InlineCode({ text, className }: { text: string; className?: string }) {
  return (
    <span className={className}>
      {text.split(/(`[^`]+`)/g).map((part, i) =>
        part.startsWith("`") && part.endsWith("`") ? (
          <code key={i} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em] text-foreground">
            {part.slice(1, -1)}
          </code>
        ) : (
          part
        )
      )}
    </span>
  )
}

export function PropsTable({ api, showName }: { api: ComponentApi; showName?: boolean }) {
  return (
    <div className="flex flex-col gap-3">
      {showName && (
        <div className="flex flex-col gap-1">
          <h3 className="font-mono text-sm font-medium">&lt;{api.name} /&gt;</h3>
          {api.description && <InlineCode text={api.description} className="text-sm text-muted-foreground" />}
        </div>
      )}
      <div className="overflow-hidden rounded-xl border">
        <Table className="min-w-xl">
          <TableHeader className="bg-muted/40 text-xs">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-4 text-muted-foreground">Prop</TableHead>
              <TableHead className="px-4 text-muted-foreground">Type</TableHead>
              <TableHead className="px-4 text-muted-foreground">Default</TableHead>
              <TableHead className="px-4 text-muted-foreground">Description</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {api.props.map((p) => (
              <TableRow key={p.name} className="align-top hover:bg-transparent">
                <TableCell className="px-4 py-3 align-top font-mono text-[13px]">
                  {p.name}
                  {p.required && (
                    <span className="text-destructive" title="Required">
                      *
                    </span>
                  )}
                </TableCell>
                <TableCell className="max-w-56 px-4 py-3 align-top font-mono text-xs break-words whitespace-normal text-muted-foreground">
                  {p.type}
                </TableCell>
                <TableCell
                  className={cn(
                    "px-4 py-3 align-top text-xs",
                    p.default && !p.default.includes(" ") ? "font-mono" : "text-muted-foreground"
                  )}
                >
                  {p.default ?? "—"}
                </TableCell>
                <TableCell className="min-w-64 px-4 py-3 align-top leading-relaxed text-pretty whitespace-normal text-muted-foreground">
                  <InlineCode text={p.description} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {api.extends && (
        <p className="text-xs text-muted-foreground">
          Also accepts every <code className="font-mono text-foreground">{api.extends}</code> prop, which is spread onto
          the root element.
        </p>
      )}
    </div>
  )
}
