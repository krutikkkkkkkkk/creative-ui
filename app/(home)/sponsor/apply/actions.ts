"use server"

import { z } from "zod"

import { redis } from "@/lib/redis"

/* Each submission is pushed onto this list as JSON, newest first. */
const APPLICATIONS_KEY = "sponsors:applications"

const schema = z
  .object({
    tier: z.enum(["diamond", "gold", "silver"], { message: "Pick a tier." }),
    name: z.string().trim().min(1, "Add the name to show.").max(60),
    website: z.string().trim().url("Use a full link, starting with https://"),
    logo: z.string().trim().url("Use a full link to the logo file, starting with https://"),
    offer: z.string().trim().max(80, "Keep the offer under 80 characters.").optional(),
    github: z
      .string()
      .trim()
      .regex(/^@?[a-z\d](?:[a-z\d-]{0,38})$/i, "Use the GitHub username that sponsors."),
    contact: z.string().trim().min(1, "Add a contact name.").max(80),
    email: z.string().trim().email("Use a valid email."),
    notes: z.string().trim().max(1000).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.tier === "diamond" && !data.offer) {
      ctx.addIssue({ code: "custom", path: ["offer"], message: "Diamond sponsors show an offer under their logo." })
    }
  })

export type Field = keyof z.input<typeof schema>

export type ApplyState = {
  status: "idle" | "error" | "success"
  message?: string
  errors?: Partial<Record<Field, string>>
  values?: Partial<Record<Field, string>>
}

export async function submitSponsor(_prev: ApplyState, formData: FormData): Promise<ApplyState> {
  const values = Object.fromEntries(
    [...formData.entries()].filter((entry): entry is [string, string] => typeof entry[1] === "string")
  ) as Partial<Record<Field | "company_url", string>>

  /* Honeypot: hidden from people, filled in by bots. Pretend it worked. */
  if (values.company_url) return { status: "success" }

  const parsed = schema.safeParse({ ...values, offer: values.offer || undefined, notes: values.notes || undefined })
  if (!parsed.success) {
    const errors: ApplyState["errors"] = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as Field
      errors[field] ??= issue.message
    }
    return { status: "error", message: "Check the highlighted fields.", errors, values }
  }

  const { offer, ...data } = parsed.data
  const application = {
    ...data,
    github: data.github.replace(/^@/, ""),
    /* Only Diamond shows an offer. */
    offer: data.tier === "diamond" ? offer : undefined,
    submittedAt: new Date().toISOString(),
  }

  try {
    await redis.lpush(APPLICATIONS_KEY, JSON.stringify(application))
  } catch (error) {
    console.error("[sponsor] Redis write failed", error)
    return { status: "error", message: "Couldn't save your details. Try again in a minute.", values }
  }

  return { status: "success" }
}
