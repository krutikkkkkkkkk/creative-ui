"use client"

import { usePathname } from "next/navigation"

import { UI_STYLES } from "@/lib/ui-style"

const STYLE_PREFIX = new RegExp(`^/(?:${UI_STYLES.join("|")})(?=/|$)`)

/**
 * usePathname without the look's segment. Pages are prerendered at /classic/... and /modern/...,
 * so on the server the path carries the prefix while the browser shows the plain URL. Stripping
 * it keeps server and client markup the same.
 */
export function useSitePathname() {
  return usePathname().replace(STYLE_PREFIX, "") || "/"
}
