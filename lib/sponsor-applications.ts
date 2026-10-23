import "server-only"

import { redis } from "@/lib/redis"
import type { Tier } from "@/lib/sponsors"

/* A sponsor's details, saved before checkout and marked paid by the Dodo webhook. */
export type Application = {
  id: string
  tier: Tier
  name: string
  website: string
  logo: string
  offer?: string
  contact: string
  email: string
  notes?: string
  status: "pending" | "paid"
  submittedAt: string
  paidAt?: string
  subscriptionId?: string
}

/* Unpaid applications expire after a week. Paid ones are kept. */
export const APPLICATION_TTL = 60 * 60 * 24 * 7

export const applicationKey = (id: string) => `sponsors:application:${id}`

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function getApplication(id: string | undefined) {
  if (!id || !UUID.test(id)) return null
  try {
    /* Upstash parses JSON values on read. */
    return await redis.get<Application>(applicationKey(id))
  } catch (error) {
    console.error("[sponsor] Redis read failed", error)
    return null
  }
}
