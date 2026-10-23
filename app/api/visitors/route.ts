import { NextResponse } from "next/server"

import { redis, VISITORS_KEY } from "@/lib/visitors"

const ID = /^[0-9a-f-]{36}$/i

export const dynamic = "force-dynamic"

export async function GET() {
  return NextResponse.json({ count: await redis.pfcount(VISITORS_KEY) })
}

export async function POST(request: Request) {
  const { id } = await request.json().catch(() => ({}))
  if (typeof id !== "string" || !ID.test(id)) {
    return NextResponse.json({ error: "Invalid visitor id" }, { status: 400 })
  }
  await redis.pfadd(VISITORS_KEY, id)
  return NextResponse.json({ count: await redis.pfcount(VISITORS_KEY) })
}
