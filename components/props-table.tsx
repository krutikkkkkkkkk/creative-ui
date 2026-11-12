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

/* One table, two layouts, chosen by the table's own width (a container query, so it holds with
   the sidebar open or closed).

   From 38rem: four fixed columns (the name column is a fixed 11rem, so the longest prop names
   never break). Every table on a page shares the same columns, so names, types and defaults
   line up down the page.

   Below that: each prop becomes a stacked row (name with its default on the right, then the
   type, then the description), so nothing is pushed off-screen into a sideways scroll.
   The explicit roles keep it a table for assistive tech once the rows stop being table rows. */
const CELL = "px-4 py-3 align-top whitespace-normal @max-[38rem]:block @max-[38rem]:p-0"

export function PropsTable({ api, showName }: { api: ComponentApi; showName?: boolean }) {
  return (
    <div className="flex flex-col gap-4">
      {showName && (
        <div className="flex flex-col gap-1.5">
          <h3 className="font-mono text-sm font-medium">&lt;{api.name} /&gt;</h3>
          {api.description && (
            <InlineCode text={api.description} className="max-w-3xl text-sm leading-relaxed text-pretty text-muted-foreground" />
          )}
        </div>
      )}
      <div className="@container">
        <div className="overflow-hidden rounded-xl border">
          <Table role="table" className="table-fixed @max-[38rem]:block">
            <colgroup>
              <col className="w-44" />
              <col className="w-[20%]" />
              <col className="w-[12%]" />
              <col />
            </colgroup>
            <TableHeader role="rowgroup" className="bg-muted/40 text-xs @max-[38rem]:sr-only">
              <TableRow role="row" className="hover:bg-transparent">
                {["Prop", "Type", "Default", "Description"].map((label) => (
                  <TableHead key={label} role="columnheader" className="h-10 px-4 font-medium text-muted-foreground">
                    {label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody role="rowgroup" className="@max-[38rem]:block">
              {api.props.map((p) => (
                <TableRow
                  key={p.name}
                  role="row"
                  className="hover:bg-transparent @max-[38rem]:grid @max-[38rem]:grid-cols-[minmax(0,1fr)_auto] @max-[38rem]:gap-x-4 @max-[38rem]:gap-y-1.5 @max-[38rem]:px-4 @max-[38rem]:py-3.5"
                >
                  <TableCell role="cell" className={cn(CELL, "font-mono text-[13px] font-medium break-words")}>
                    {p.name}
                    {p.required && (
                      <span className="text-destructive" title="Required">
                        *
                      </span>
                    )}
                  </TableCell>
                  <TableCell
                    role="cell"
                    className={cn(
                      CELL,
                      "font-mono text-xs leading-relaxed break-words text-muted-foreground @max-[38rem]:col-span-2 @max-[38rem]:row-start-2"
                    )}
                  >
                    {p.type}
                  </TableCell>
                  <TableCell
                    role="cell"
                    className={cn(
                      CELL,
                      "text-xs break-words @max-[38rem]:col-start-2 @max-[38rem]:row-start-1 @max-[38rem]:text-right @max-[38rem]:before:font-sans @max-[38rem]:before:text-muted-foreground @max-[38rem]:before:content-['default_']",
                      p.default && !p.default.includes(" ") ? "font-mono" : "text-muted-foreground",
                      !p.default && "@max-[38rem]:hidden"
                    )}
                  >
                    {p.default ?? "—"}
                  </TableCell>
                  <TableCell
                    role="cell"
                    className={cn(
                      CELL,
                      "leading-relaxed text-pretty text-muted-foreground @max-[38rem]:col-span-2 @max-[38rem]:row-start-3"
                    )}
                  >
                    <InlineCode text={p.description} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
      {api.extends && (
        <p className="text-xs leading-relaxed text-muted-foreground">
          Also accepts every <code className="font-mono text-foreground">{api.extends}</code> prop, which is spread onto
          the root element.
        </p>
      )}
    </div>
  )
}
