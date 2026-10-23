"use client"

import { cloneElement, useActionState, useId, useState } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon } from "@hugeicons/core-free-icons"

import { TIERS, offerPrice, type Tier } from "@/lib/sponsors"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Textarea } from "@/components/ui/textarea"

import { submitSponsor, type ApplyState, type Field } from "./actions"

const OFFER_MAX = 80

/** Step one of sponsoring. A valid submit saves the details and redirects to Dodo checkout. */
export function SponsorForm({
  defaultTier,
  initialValues,
}: {
  defaultTier: Tier
  /** Details from an earlier attempt, when a payment didn't go through. */
  initialValues?: Partial<Record<Field, string>>
}) {
  const [state, action, pending] = useActionState<ApplyState, FormData>(submitSponsor, {
    status: "idle",
    values: initialValues,
  })
  /* Controlled so they survive the form reset after a failed submit. */
  const [tier, setTier] = useState<Tier>(defaultTier)
  const [offer, setOffer] = useState(initialValues?.offer ?? "")

  const v = state.values ?? {}
  const err = state.errors ?? {}

  return (
    <form action={action} noValidate className="flex flex-col gap-12">
      {/* Honeypot, hidden from people and screen readers. */}
      <input type="text" name="company_url" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <Group n="01" title="Tier">
        <RadioGroup
          name="tier"
          value={tier}
          onValueChange={(value) => setTier(value as Tier)}
          className="grid gap-3 sm:grid-cols-3"
        >
          {TIERS.map(({ tier: t, label, price }) => (
            <Label
              key={t}
              htmlFor={`tier-${t}`}
              className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-xl border p-4 transition-colors hover:bg-accent/60",
                tier === t && "border-foreground/40 bg-accent/60"
              )}
            >
              <span className="flex items-center gap-3">
                <RadioGroupItem id={`tier-${t}`} value={t} />
                <span className="font-serif text-2xl font-normal tracking-[-0.01em]">{label}</span>
              </span>
              <span className="font-mono text-[11px] font-normal tracking-[.08em] text-muted-foreground uppercase">
                ${offerPrice(price)}/mo
              </span>
            </Label>
          ))}
        </RadioGroup>
        <ErrorText field="tier" errors={err} />
      </Group>

      <Group n="02" title="What goes on the wall">
        <Row>
          <Field label="Name to show" field="name" errors={err}>
            <Input id="name" name="name" defaultValue={v.name} placeholder="Acme" autoComplete="organization" />
          </Field>
          <Field label="Link" hint="Where the logo points." field="website" errors={err}>
            <Input id="website" name="website" type="url" defaultValue={v.website} placeholder="https://acme.com" />
          </Field>
        </Row>
        <Field
          label="Logo file link"
          hint="A public link to an SVG (best) or a transparent PNG. Dark artwork works best; it's inverted in dark mode."
          field="logo"
          errors={err}
        >
          <Input id="logo" name="logo" type="url" defaultValue={v.logo} placeholder="https://acme.com/logo.svg" />
        </Field>
        {tier === "diamond" && (
          <Field
            label="Tagline or offer"
            hint="Optional. Anything you like, shown under your logo in the docs sidebar and on the sponsor page. Leave it empty if you don't need one."
            field="offer"
            errors={err}
            aside={
              <span
                className={cn(
                  "font-mono text-[11px] text-muted-foreground tabular-nums",
                  offer.length > OFFER_MAX && "text-destructive"
                )}
              >
                {offer.length}/{OFFER_MAX}
              </span>
            }
          >
            <Input
              id="offer"
              name="offer"
              value={offer}
              onChange={(e) => setOffer(e.target.value)}
              placeholder="20% off Pro for creative-ui users, code CREATIVEUI"
            />
          </Field>
        )}
      </Group>

      <Group n="03" title="Who we talk to">
        <Row>
          <Field label="Contact name" field="contact" errors={err}>
            <Input id="contact" name="contact" defaultValue={v.contact} autoComplete="name" />
          </Field>
          <Field label="Email" hint="Checkout and receipts use this email." field="email" errors={err}>
            <Input id="email" name="email" type="email" defaultValue={v.email} autoComplete="email" />
          </Field>
        </Row>
        <Field label="Anything else" hint="Optional." field="notes" errors={err}>
          <Textarea id="notes" name="notes" defaultValue={v.notes} rows={4} />
        </Field>
      </Group>

      <div className="flex flex-wrap items-center gap-4 border-t pt-8">
        <Button
          type="submit"
          disabled={pending}
          className="h-11 gap-2 rounded-full px-5 font-mono text-[11px] font-normal tracking-[.08em] uppercase has-[>svg]:px-5"
        >
          {pending ? "Opening checkout…" : "Continue to payment"}
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
        </Button>
        {state.status === "error" && state.message ? (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Next, pay securely with Dodo Payments.</p>
        )}
      </div>
    </form>
  )
}

function Group({ n, title, children }: { n: string; title: string; children: React.ReactNode }) {
  const id = useId()
  return (
    <div role="group" aria-labelledby={id} className="grid gap-6 border-t pt-8 md:grid-cols-[180px_1fr] md:gap-10">
      <div>
        <p className="font-mono text-[11px] tracking-[.08em] text-muted-foreground">{n} —</p>
        <h2 id={id} className="mt-1 font-serif text-3xl tracking-[-0.01em]">
          {title}
        </h2>
      </div>
      <div className="flex min-w-0 flex-col gap-6">{children}</div>
    </div>
  )
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-6 sm:grid-cols-2">{children}</div>
}

function Field({
  label,
  hint,
  field,
  errors,
  aside,
  children,
}: {
  label: string
  hint?: string
  field: Field
  errors: Partial<Record<Field, string>>
  aside?: React.ReactNode
  children: React.ReactElement<{ "aria-invalid"?: boolean }>
}) {
  const invalid = !!errors[field]
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-3">
        <Label htmlFor={field}>{label}</Label>
        {aside}
      </div>
      {cloneElement(children, { "aria-invalid": invalid })}
      {hint && !invalid && <p className="text-xs text-muted-foreground">{hint}</p>}
      <ErrorText field={field} errors={errors} />
    </div>
  )
}

function ErrorText({ field, errors }: { field: Field; errors: Partial<Record<Field, string>> }) {
  if (!errors[field]) return null
  return <p className="text-xs text-destructive">{errors[field]}</p>
}
