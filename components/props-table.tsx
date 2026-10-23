import type { ComponentApi } from "@/lib/docs"
import { cn } from "@/lib/utils"

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
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full min-w-xl text-left text-sm">
          <thead className="border-b bg-muted/40 text-xs text-muted-foreground">
            <tr>
              <th className="px-4 py-2.5 font-medium">Prop</th>
              <th className="px-4 py-2.5 font-medium">Type</th>
              <th className="px-4 py-2.5 font-medium">Default</th>
              <th className="px-4 py-2.5 font-medium">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {api.props.map((p) => (
              <tr key={p.name} className="align-top">
                <td className="px-4 py-3 font-mono text-[13px] whitespace-nowrap">
                  {p.name}
                  {p.required && (
                    <span className="text-destructive" title="Required">
                      *
                    </span>
                  )}
                </td>
                <td className="max-w-56 px-4 py-3 font-mono text-xs break-words text-muted-foreground">{p.type}</td>
                <td
                  className={cn(
                    "px-4 py-3 text-xs whitespace-nowrap",
                    p.default && !p.default.includes(" ") ? "font-mono" : "text-muted-foreground"
                  )}
                >
                  {p.default ?? "—"}
                </td>
                <td className="min-w-64 px-4 py-3 leading-relaxed text-pretty text-muted-foreground">
                  <InlineCode text={p.description} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
