"use client"

import { cloneElement, useActionState, useId } from "react"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, CheckmarkCircle02Icon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { BRAND } from "@/components/home-primitives"

import { submitPlatformSponsor, type Field, type PlatformState } from "./actions"

/** Platform sponsor inquiry. A valid submit emails the details; the reply comes by email. */
export function PlatformForm() {
  const [state, action, pending] = useActionState<PlatformState, FormData>(submitPlatformSponsor, { status: "idle" })

  const v = state.values ?? {}
  const err = state.errors ?? {}

  if (state.status === "sent") {
    return (
      <div role="status" className="flex flex-col items-start gap-4 border-t pt-8">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} className="size-8" style={{ color: BRAND }} strokeWidth={2} />
        <h2 className="font-serif text-4xl leading-[0.95] tracking-[-0.02em]">
          {v.name ? `Thanks, ${v.name}.` : "Thanks."}
        </h2>
        <p className="max-w-[52ch] text-base leading-relaxed text-pretty text-muted-foreground">
          Your details are in. You&apos;ll get a reply at{" "}
          {v.email ? <span className="text-foreground">{v.email}</span> : "your email"}, normally within a few days.
        </p>
      </div>
    )
  }

  return (
    <form action={action} noValidate className="flex flex-col gap-12">
      {/* Honeypot, hidden from people and screen readers. */}
      <input type="text" name="company_url" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />

      <Group n="01" title="What you offer">
        <Row>
          <Field label="Company or product" field="name" errors={err}>
            <Input id="name" name="name" defaultValue={v.name} placeholder="Acme" autoComplete="organization" />
          </Field>
          <Field label="Link" hint="Where the logo points." field="website" errors={err}>
            <Input id="website" name="website" type="url" defaultValue={v.website} placeholder="https://acme.com" />
          </Field>
        </Row>
        <Field label="What you'd provide" hint="Credits, hosting, a tool licence, anything the project runs on." field="provides" errors={err}>
          <Input id="provides" name="provides" defaultValue={v.provides} placeholder="Hosting credits" />
        </Field>
      </Group>

      <Group n="02" title="Who we talk to">
        <Row>
          <Field label="Contact name" field="contact" errors={err}>
            <Input id="contact" name="contact" defaultValue={v.contact} autoComplete="name" />
          </Field>
          <Field label="Email" hint="The reply goes here." field="email" errors={err}>
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
          {pending ? "Sending…" : "Send details"}
          <HugeiconsIcon icon={ArrowRight01Icon} className="size-4" strokeWidth={2} />
        </Button>
        {state.status === "error" && state.message ? (
          <p role="alert" className="text-sm text-destructive">
            {state.message}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">No payment. We reply by email.</p>
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
  children,
}: {
  label: string
  hint?: string
  field: Field
  errors: Partial<Record<Field, string>>
  children: React.ReactElement<{ "aria-invalid"?: boolean }>
}) {
  const invalid = !!errors[field]
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={field}>{label}</Label>
      {cloneElement(children, { "aria-invalid": invalid })}
      {hint && !invalid && <p className="text-xs text-muted-foreground">{hint}</p>}
      {invalid && <p className="text-xs text-destructive">{errors[field]}</p>}
    </div>
  )
}
