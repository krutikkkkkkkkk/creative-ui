import "server-only"

import { redis } from "@/lib/redis"

/* HyperLogLog: counts unique ids in ~12KB, re-adding an id is a no-op. */
export const VISITORS_KEY = "visitors:unique"

/** Unique visitor total, or null when Redis is unreachable. */
export async function getVisitorCount() {
  try {
    return await redis.pfcount(VISITORS_KEY)
  } catch (error) {
    console.error("[visitors] Redis read failed", error)
    return null
  }
}
