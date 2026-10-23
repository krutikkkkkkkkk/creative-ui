"use client"

import * as React from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ViewIcon } from "@hugeicons/core-free-icons"

import { cn } from "@/lib/utils"

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
    <div
      className={cn("flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs", className)}
      title={count === null ? undefined : `${count.toLocaleString("en")} ${label}`}
    >
      <HugeiconsIcon icon={ViewIcon} className="size-4 text-muted-foreground" strokeWidth={2} aria-hidden />
      <p className="whitespace-nowrap text-muted-foreground">
        {formatted === null ? (
          <span className="inline-block h-3.5 w-7 animate-pulse rounded bg-foreground/10 align-middle" />
        ) : (
          <span className="font-mono font-semibold text-foreground tabular-nums">{formatted}</span>
        )}
        <span className="hidden sm:inline"> {label}</span>
      </p>
    </div>
  )
}
