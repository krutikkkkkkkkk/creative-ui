"use server"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { z } from "zod"

import { dodo } from "@/lib/dodo"
import { redis } from "@/lib/redis"
import { APPLICATION_TTL, applicationKey, type Application } from "@/lib/sponsor-applications"
import { LAUNCH_OFFER, SPONSORS, TIERS } from "@/lib/sponsors"

const schema = z.object({
  tier: z.enum(["diamond", "gold", "silver"], { message: "Pick a tier." }),
  name: z.string().trim().min(1, "Add the name to show.").max(60),
  website: z.string().trim().url("Use a full link, starting with https://"),
  logo: z.string().trim().url("Use a full link to the logo file, starting with https://"),
  /* Diamond only, and optional. Anything goes: a tagline, an offer, or nothing. */
  offer: z.string().trim().max(80, "Keep it under 80 characters.").optional(),
  contact: z.string().trim().min(1, "Add a contact name.").max(80),
  email: z.string().trim().email("Use a valid email."),
  notes: z.string().trim().max(1000).optional(),
})

export type Field = keyof z.input<typeof schema>

export type ApplyState = {
  status: "idle" | "error"
  message?: string
  errors?: Partial<Record<Field, string>>
  values?: Partial<Record<Field, string>>
}

/**
 * Step one of sponsoring: save the details as a pending application, then open a Dodo
 * checkout for the tier. The webhook marks the application paid and emails the details.
 */
export async function submitSponsor(_prev: ApplyState, formData: FormData): Promise<ApplyState> {
  const values = Object.fromEntries(
    [...formData.entries()].filter((entry): entry is [string, string] => typeof entry[1] === "string")
  ) as Partial<Record<Field | "company_url", string>>

  /* Honeypot: hidden from people, filled in by bots. Pretend it worked. */
  if (values.company_url) redirect("/sponsor/thanks")

  const parsed = schema.safeParse({ ...values, offer: values.offer || undefined, notes: values.notes || undefined })
  if (!parsed.success) {
    const errors: ApplyState["errors"] = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as Field
      errors[field] ??= issue.message
    }
    return { status: "error", message: "Check the highlighted fields.", errors, values }
  }

  const plan = TIERS.find((t) => t.tier === parsed.data.tier)!
  if (SPONSORS.filter((s) => s.tier === plan.tier).length >= plan.slots) {
    return { status: "error", message: `${plan.label} is full. Pick another tier or join the waitlist.`, values }
  }

  const { offer, ...data } = parsed.data
  const application: Application = {
    id: crypto.randomUUID(),
    ...data,
    /* Only Diamond shows an offer. */
    offer: data.tier === "diamond" ? offer : undefined,
    status: "pending",
    submittedAt: new Date().toISOString(),
  }

  try {
    await redis.set(applicationKey(application.id), JSON.stringify(application), { ex: APPLICATION_TTL })
  } catch (error) {
    console.error("[sponsor] Redis write failed", error)
    return { status: "error", message: "Couldn't save your details. Try again in a minute.", values }
  }

  const checkoutUrl = await createCheckout(application)
  if (!checkoutUrl) {
    return { status: "error", message: "Checkout couldn't start. Your details are saved, so try again in a minute.", values }
  }

  /* redirect() throws, so it stays outside any try. */
  redirect(checkoutUrl)
}

async function createCheckout(application: Application) {
  const plan = TIERS.find((t) => t.tier === application.tier)!
  const h = await headers()
  const host = h.get("host") ?? new URL(process.env.NEXT_PUBLIC_BASE_URL ?? "https://ui.krutikraut.com").host
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https")

  const create = (discountCodes?: string[]) =>
    dodo().checkoutSessions.create({
      product_cart: [{ product_id: plan.productId, quantity: 1 }],
      customer: { email: application.email, name: application.contact },
      /* Dodo appends subscription_id and status to this URL. */
      return_url: `${proto}://${host}/sponsor/thanks?application=${application.id}`,
      /* Carried onto the subscription, so the webhook can find the saved details. */
      metadata: { tier: application.tier, application: application.id },
      discount_codes: discountCodes,
      feature_flags: { allow_discount_code: true },
    })

  try {
    return (await create(LAUNCH_OFFER ? [LAUNCH_OFFER.code] : undefined)).checkout_url
  } catch (error) {
    console.error("[sponsor] Checkout session failed", error)
  }
  /* A missing or expired launch code shouldn't block checkout. The sponsor can still type a code. */
  if (LAUNCH_OFFER) {
    try {
      return (await create()).checkout_url
    } catch (error) {
      console.error("[sponsor] Checkout session failed without the launch code", error)
    }
  }
  return null
}
