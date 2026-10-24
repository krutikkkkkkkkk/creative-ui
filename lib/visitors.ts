import "server-only"

import { redis } from "@/lib/redis"

/* HyperLogLog: counts unique ids in ~12KB, re-adding an id is a no-op. */
export const VISITORS_KEY = "visitors:unique"

/* Plain counter, one per page shown (full loads and client-side navigations). */
export const PAGEVIEWS_KEY = "pageviews:total"

/** Page view total, or null when Redis is unreachable. */
export async function getPageViewCount() {
  try {
    return (await redis.get<number>(PAGEVIEWS_KEY)) ?? 0
  } catch (error) {
    console.error("[pageviews] Redis read failed", error)
    return null
  }
}

/** Unique visitor total, or null when Redis is unreachable. */
export async function getVisitorCount() {
  try {
    return await redis.pfcount(VISITORS_KEY)
  } catch (error) {
    console.error("[visitors] Redis read failed", error)
    return null
  }
}
