import { NextResponse } from "next/server"

import { redis } from "@/lib/redis"
import { getVisitorCount, VISITORS_KEY } from "@/lib/visitors"

const ID = /^[0-9a-f-]{36}$/i

export const dynamic = "force-dynamic"

/** 503 with a null count when Redis is unreachable, so the client can hide the pill. */
function countResponse(count: number | null) {
  return NextResponse.json({ count }, { status: count === null ? 503 : 200 })
}

export async function GET() {
  return countResponse(await getVisitorCount())
}

export async function POST(request: Request) {
  const { id } = await request.json().catch(() => ({}))
  if (typeof id !== "string" || !ID.test(id)) {
    return NextResponse.json({ error: "Invalid visitor id" }, { status: 400 })
  }
  try {
    await redis.pfadd(VISITORS_KEY, id)
  } catch (error) {
    console.error("[visitors] Redis write failed", error)
    return countResponse(null)
  }
  return countResponse(await getVisitorCount())
}
