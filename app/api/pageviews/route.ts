import { NextResponse } from "next/server"

import { redis } from "@/lib/redis"
import { getPageViewCount, PAGEVIEWS_KEY } from "@/lib/visitors"

export const dynamic = "force-dynamic"

/** 503 with a null count when Redis is unreachable, so the client can hide the number. */
function countResponse(count: number | null) {
  return NextResponse.json({ count }, { status: count === null ? 503 : 200 })
}

export async function GET() {
  return countResponse(await getPageViewCount())
}

/** Records one page view and returns the new total. */
export async function POST() {
  try {
    return countResponse(await redis.incr(PAGEVIEWS_KEY))
  } catch (error) {
    console.error("[pageviews] Redis write failed", error)
    return countResponse(null)
  }
}
