"use server"

import { z } from "zod"

import { EMAIL_FROM, resend } from "@/lib/email"
import { SPONSOR_EMAIL } from "@/lib/sponsors"

const schema = z.object({
  name: z.string().trim().min(1, "Add your company or product name.").max(60),
  website: z.string().trim().url("Use a full link, starting with https://"),
  provides: z.string().trim().min(1, "Say what you'd like to offer.").max(80),
  contact: z.string().trim().min(1, "Add a contact name.").max(80),
  email: z.string().trim().email("Use a valid email."),
  notes: z.string().trim().max(1000).optional(),
})

export type Field = keyof z.input<typeof schema>

export type PlatformState = {
  status: "idle" | "error" | "sent"
  message?: string
  errors?: Partial<Record<Field, string>>
  values?: Partial<Record<Field, string>>
}

/** Platform sponsorships aren't paid, so there's no checkout: the details are emailed for a reply. */
export async function submitPlatformSponsor(_prev: PlatformState, formData: FormData): Promise<PlatformState> {
  const values = Object.fromEntries(
    [...formData.entries()].filter((entry): entry is [string, string] => typeof entry[1] === "string")
  ) as Partial<Record<Field | "company_url", string>>

  /* Honeypot: hidden from people, filled in by bots. Pretend it worked. */
  if (values.company_url) return { status: "sent" }

  const parsed = schema.safeParse({ ...values, notes: values.notes || undefined })
  if (!parsed.success) {
    const errors: PlatformState["errors"] = {}
    for (const issue of parsed.error.issues) {
      const field = issue.path[0] as Field
      errors[field] ??= issue.message
    }
    return { status: "error", message: "Check the highlighted fields.", errors, values }
  }

  const failed: PlatformState = {
    status: "error",
    message: `Couldn't send your details. Try again in a minute, or email ${SPONSOR_EMAIL}.`,
    values,
  }

  const to = process.env.SPONSOR_NOTIFY_EMAIL
  if (!to) {
    console.warn("[sponsor] SPONSOR_NOTIFY_EMAIL is not set, can't send a platform sponsor inquiry")
    return failed
  }

  const d = parsed.data
  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    replyTo: d.email,
    subject: `Platform sponsor inquiry: ${d.name}`,
    text: [
      ["Name", d.name],
      ["Link", d.website],
      ["Offers", d.provides],
      ["Contact", d.contact],
      ["Email", d.email],
      ["Notes", d.notes],
    ]
      .filter(([, value]) => value)
      .map(([label, value]) => `${label}: ${value}`)
      .join("\n"),
  })
  if (error) {
    console.error("[sponsor] Platform sponsor email failed", error)
    return failed
  }

  return { status: "sent", values: { name: d.name, email: d.email } }
}
