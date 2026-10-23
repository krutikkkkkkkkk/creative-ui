import { after, NextResponse } from "next/server"
import type { UnwrapWebhookEvent } from "dodopayments/resources/webhooks/webhooks"

import { dodo } from "@/lib/dodo"
import { EMAIL_FROM, resend } from "@/lib/email"
import { redis } from "@/lib/redis"
import { applicationKey, getApplication, type Application } from "@/lib/sponsor-applications"
import { TIERS } from "@/lib/sponsors"

/* Latest state of each sponsorship, keyed by Dodo subscription id. */
const SUBSCRIPTIONS_KEY = "sponsors:subscriptions"

/* Statuses that change what goes on the wall, so they get an email. Renewals only update Redis. */
const NOTIFY = new Set([
  "subscription.plan_changed",
  "subscription.on_hold",
  "subscription.cancelled",
  "subscription.expired",
  "subscription.failed",
])

type SubscriptionEvent = Extract<UnwrapWebhookEvent, { type: `subscription.${string}` }>
type SubscriptionRecord = ReturnType<typeof toRecord>

export async function POST(request: Request) {
  const body = await request.text()

  let event: UnwrapWebhookEvent
  try {
    event = dodo().webhooks.unwrap(body, { headers: Object.fromEntries(request.headers) })
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  if (!event.type.startsWith("subscription.")) return NextResponse.json({ received: true })

  /* Dodo retries until it gets a 2xx, so skip deliveries already handled. */
  const id = request.headers.get("webhook-id")
  if (id && !(await redis.set(`dodo:webhook:${id}`, 1, { nx: true, ex: 60 * 60 * 24 * 7 }))) {
    return NextResponse.json({ received: true })
  }

  const { data, type } = event as SubscriptionEvent
  const record = toRecord(data, type)

  /* The details form saved the sponsor's application before checkout. Its id rides on the metadata. */
  const applicationId = data.metadata?.application
  const application = await getApplication(typeof applicationId === "string" ? applicationId : undefined)

  try {
    await redis.hset(SUBSCRIPTIONS_KEY, { [record.subscriptionId]: JSON.stringify(record) })
    /* First successful payment: mark the application paid and keep it (set without ex drops the TTL). */
    if (type === "subscription.active" && application?.status === "pending") {
      const paid: Application = {
        ...application,
        status: "paid",
        paidAt: new Date().toISOString(),
        subscriptionId: record.subscriptionId,
      }
      await redis.set(applicationKey(application.id), JSON.stringify(paid))
      after(() => notifyNewSponsor(paid, record))
    } else if (type === "subscription.active" && !application) {
      after(() => notifyNewSponsor(null, record))
    }
  } catch (error) {
    console.error("[sponsor] Redis write failed", error)
    if (id) await redis.del(`dodo:webhook:${id}`).catch(() => {})
    /* A 5xx makes Dodo retry the delivery. */
    return NextResponse.json({ error: "Storage failed" }, { status: 500 })
  }

  /* A sponsorship coming back from on hold is news too; its first activation was emailed above. */
  const reactivated = type === "subscription.active" && application?.status === "paid"
  if (NOTIFY.has(type) || reactivated) after(() => notifySubscription(record, application))

  return NextResponse.json({ received: true })
}

function toRecord(data: SubscriptionEvent["data"], type: string) {
  return {
    subscriptionId: data.subscription_id,
    tier: TIERS.find((t) => t.productId === data.product_id)?.tier ?? "unknown",
    status: data.status,
    name: data.customer.name,
    email: data.customer.email,
    customerId: data.customer.customer_id,
    /* Dodo sends minor units. */
    amount: `${(data.recurring_pre_tax_amount / 100).toFixed(2)} ${data.currency}`,
    discounts: data.discounts?.length
      ? data.discounts
          .map((d) => `${d.code}${d.cycles_remaining != null ? ` (${d.cycles_remaining} cycles left)` : ""}`)
          .join(", ")
      : undefined,
    nextBillingDate: data.next_billing_date,
    event: type,
    updatedAt: new Date().toISOString(),
  }
}

/** Everything needed to put the logo up, sent once the first payment succeeds. */
async function notifyNewSponsor(application: Application | null, record: SubscriptionRecord) {
  const to = process.env.SPONSOR_NOTIFY_EMAIL
  if (!to) {
    console.warn("[sponsor] SPONSOR_NOTIFY_EMAIL is not set, skipping notification")
    return
  }

  const tier = TIERS.find((t) => t.tier === (application?.tier ?? record.tier))
  const sections: [string, [string, string | undefined][]][] = [
    [
      "On the wall",
      application
        ? [
            ["Tier", tier?.label],
            ["Name", application.name],
            ["Link", application.website],
            ["Logo", application.logo],
            ["Tagline", application.offer],
          ]
        : [["Details", "No saved application matched this subscription. Ask the sponsor for their logo and link."]],
    ],
    [
      "Contact",
      application
        ? [
            ["Name", application.contact],
            ["Email", application.email],
            ["Notes", application.notes],
          ]
        : [],
    ],
    [
      "Payment",
      [
        ["Subscription", record.subscriptionId],
        ["Status", record.status],
        ["Amount", record.amount],
        ["Discounts", record.discounts],
        ["Next billing", record.nextBillingDate],
        ["Paid by", `${record.name} <${record.email}>`],
        ["Customer", record.customerId],
      ],
    ],
    [
      "Reference",
      application
        ? [
            ["Application", application.id],
            ["Submitted", application.submittedAt],
            ["Paid", application.paidAt],
          ]
        : [],
    ],
  ]

  const text = sections
    .filter(([, rows]) => rows.length > 0)
    .map(([title, rows]) =>
      [
        title.toUpperCase(),
        ...rows.filter(([, value]) => value).map(([label, value]) => `${label}: ${value}`),
      ].join("\n")
    )
    .join("\n\n")

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    replyTo: application?.email ?? record.email,
    subject: `New ${tier?.label ?? record.tier} sponsor: ${application?.name ?? record.name}`,
    text,
  })
  if (error) console.error("[sponsor] New sponsor email failed", error)
}

async function notifySubscription(record: SubscriptionRecord, application: Application | null) {
  const to = process.env.SPONSOR_NOTIFY_EMAIL
  if (!to) {
    console.warn("[sponsor] SPONSOR_NOTIFY_EMAIL is not set, skipping notification")
    return
  }

  const { error } = await resend.emails.send({
    from: EMAIL_FROM,
    to,
    replyTo: record.email,
    subject: `Sponsorship ${record.status}: ${application?.name ?? record.name} (${record.tier})`,
    text: Object.entries({ ...record, wall: application?.name, application: application?.id })
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}: ${value}`)
      .join("\n"),
  })
  if (error) console.error("[sponsor] Notification email failed", error)
}
