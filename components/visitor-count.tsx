"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const VISITOR_ID_KEY = "creative-ui:visitor-id"

/* One request per page load, shared by every reader so the nav and the sponsor page agree. */
let visitorCount: Promise<number | false> | undefined

/* Registers this browser once (random id in localStorage) and resolves to the unique total. */
function loadVisitorCount() {
  visitorCount ??= (async () => {
    let id: string | null = null
    try {
      id = localStorage.getItem(VISITOR_ID_KEY)
      if (!id) {
        id = crypto.randomUUID()
        localStorage.setItem(VISITOR_ID_KEY, id)
      }
    } catch {
      // Storage blocked: still show the total, just don't register.
    }

    try {
      const res = await fetch("/api/visitors", {
        method: id ? "POST" : "GET",
        headers: id ? { "Content-Type": "application/json" } : undefined,
        body: id ? JSON.stringify({ id }) : undefined,
      })
      const data = res.ok ? await res.json() : null
      if (typeof data?.count === "number") return data.count
    } catch {}
    // Let the next reader retry.
    visitorCount = undefined
    return false
  })()
  return visitorCount
}

/* The unique total: null while loading, false when the count is unavailable. */
function useVisitorCount() {
  const [count, setCount] = React.useState<number | null | false>(null)

  React.useEffect(() => {
    let active = true
    loadVisitorCount().then((total) => {
      if (active) setCount(total)
    })
    return () => {
      active = false
    }
  }, [])

  return count
}

function compact(n: number) {
  return new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(n)
}

/** Bare visitor total that starts from a server-read value and settles on the nav's count. */
export function VisitorTotal({ initial }: { initial: number | null }) {
  const count = useVisitorCount()
  const value = typeof count === "number" ? count : initial
  return value === null ? "—" : compact(value)
}

export function VisitorCount({ className }: { className?: string }) {
  const count = useVisitorCount()
  if (count === false) return null
  const label = count === 1 ? "visitor" : "visitors"
  const formatted = count === null ? null : compact(count)

  return (
    <Badge
      asChild
      variant="outline"
      className={cn("h-8 gap-1.5 px-3 font-normal text-muted-foreground [&>svg]:size-4", className)}
    >
      <div title={count === null ? undefined : `${count.toLocaleString("en")} ${label}`}>
        <HugeiconsIcon icon={ViewIcon} strokeWidth={2} aria-hidden />
        {formatted === null ? (
          <Skeleton className="h-3.5 w-7 rounded bg-foreground/10" />
        ) : (
          <span className="font-mono font-semibold text-foreground tabular-nums">{formatted}</span>
        )}
        <span className="-ml-0.5 hidden sm:inline">{label}</span>
      </div>
    </Badge>
  )
}
