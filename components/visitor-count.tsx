"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"

const VISITOR_ID_KEY = "creative-ui:visitor-id"

/*
 * Registers this browser once (random id in localStorage) and returns the unique total:
 * null while loading, false when the count is unavailable.
 */
function useVisitorCount() {
  const [count, setCount] = React.useState<number | null | false>(null)

  React.useEffect(() => {
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

    const controller = new AbortController()
    fetch("/api/visitors", {
      method: id ? "POST" : "GET",
      headers: id ? { "Content-Type": "application/json" } : undefined,
      body: id ? JSON.stringify({ id }) : undefined,
      signal: controller.signal,
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setCount(typeof data?.count === "number" ? data.count : false))
      .catch((error) => {
        if (error?.name !== "AbortError") setCount(false)
      })
    return () => controller.abort()
  }, [])

  return count
}

export function VisitorCount({ className }: { className?: string }) {
  const count = useVisitorCount()
  if (count === false) return null
  const label = count === 1 ? "visitor" : "visitors"
  const formatted =
    count === null
      ? null
      : new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(count)

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
