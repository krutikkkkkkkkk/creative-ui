"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type TocItem = { id: string; title: string }

/* A section counts as current once its heading has passed this far below the sticky header. */
const ACTIVE_LINE = 140

/** The docs rail's table of contents. The list is rendered on the server; this only tracks the current section. */
export function OnThisPage({ items, className }: { items: TocItem[]; className?: string }) {
  const [active, setActive] = React.useState(items[0]?.id)

  React.useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const doc = document.documentElement
      // Short closing sections never reach the line, so the bottom of the page selects the last one.
      const atBottom = window.scrollY > 0 && window.innerHeight + window.scrollY >= doc.scrollHeight - 4
      let current = items[0]?.id
      if (atBottom) {
        current = items[items.length - 1]?.id
      } else {
        for (const item of items) {
          const el = document.getElementById(item.id)
          if (el && el.getBoundingClientRect().top <= ACTIVE_LINE) current = item.id
        }
      }
      setActive(current)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
    }
  }, [items])

  return (
    <nav aria-label="On this page" className={className}>
      <p className="font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">On this page</p>
      <ul className="mt-3 border-l">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l border-transparent py-1.5 pl-3.5 text-[13px] leading-snug text-muted-foreground transition-colors duration-150 outline-none hover:text-foreground focus-visible:text-foreground focus-visible:underline",
                active === item.id && "border-foreground text-foreground"
              )}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
