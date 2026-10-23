import type { Metadata } from "next"
import Link from "next/link"

import { LegalPage, LegalSection } from "@/components/legal-page"
import { pageMetadata } from "@/lib/seo"
import { LAUNCH_OFFER, SPONSOR_EMAIL } from "@/lib/sponsors"

export const metadata: Metadata = pageMetadata({
  title: "Refund and cancellation policy",
  description: "How creative-ui sponsorships are billed through Dodo Payments, how to cancel, and when a payment is refunded.",
  path: "/refund-policy",
})

const UPDATED = "24 Oct 2026"

/* Dodo Payments only allows a refund within this many days of the payment. */
const REFUND_WINDOW_DAYS = 30

/* A sponsor who cancels can get that charge back only if they ask within this many hours of it. */
const CANCEL_REFUND_HOURS = 24

export default function RefundPolicyPage() {
  return (
    <LegalPage
      eyebrow="Refund and cancellation policy"
      title={
        <>
          Cancel any time. <span className="text-muted-foreground italic">Refunds when we fall short.</span>
        </>
      }
      updated={UPDATED}
      intro="Sponsors pay a monthly subscription through Dodo Payments in exchange for logo placement on this site. This page covers how billing works, how to cancel, and when you get your money back."
    >
      <LegalSection n="01" title="Who you're paying">
        <p>
          creative-ui is run by Krutik Raut under{" "}
          <a href="https://www.infinitylinkage.com" target="_blank" rel="noreferrer">
            Infinity Linkage
          </a>
          , and this policy covers every sponsorship of the project.
        </p>
        <p>
          Payments are handled by{" "}
          <a href="https://dodopayments.com" target="_blank" rel="noreferrer">
            Dodo Payments
          </a>
          , the merchant of record for every sponsorship. Prices already include any sales tax or VAT, which Dodo
          Payments works out and pays on your behalf. Dodo Payments takes the payment and issues the invoice, so the
          charge on your statement comes from Dodo Payments
          and card details never reach this site. Their terms, shown at checkout, apply to the payment alongside this
          policy.
        </p>
      </LegalSection>

      <LegalSection n="02" title="What you're paying for">
        <p>
          Each tier is a subscription billed in USD every month from the day you check out, tax included, and it renews
          automatically until you cancel. The price and where the logo appears for each tier are listed on the{" "}
          <Link href="/sponsor">sponsor page</Link>.
        </p>
        {LAUNCH_OFFER && (
          <p>
            <strong>Launch discount.</strong> Code {LAUNCH_OFFER.code} takes {LAUNCH_OFFER.percent}% off your first{" "}
            {LAUNCH_OFFER.months} monthly payments and is applied for you at checkout. From payment{" "}
            {LAUNCH_OFFER.months + 1} the subscription renews at the tier&apos;s full price. That step up is part of
            the offer, not a price change. Any refund of a discounted month is for the amount you actually paid.
          </p>
        )}
        <p>
          You start with the <Link href="/sponsor/apply">details form</Link> for your logo, link and, for Diamond,
          an optional tagline or offer, then pay at checkout. Once Dodo Payments confirms the payment, your logo
          goes up on the next deploy, normally within 7 days.
        </p>
      </LegalSection>

      <LegalSection n="03" title="Cancelling">
        <p>
          Cancel or change tier at any time from the{" "}
          <a href="https://customer.dodopayments.com" target="_blank" rel="noreferrer">
            Dodo Payments customer portal
          </a>{" "}
          using the email you paid with, or email <a href={`mailto:${SPONSOR_EMAIL}`}>{SPONSOR_EMAIL}</a> and it is
          done for you. The portal also has every invoice.
        </p>
        <p>
          Your placement stays live until the end of the month you have already paid for, then comes down on the
          next deploy. Nothing is charged after you cancel.
        </p>
        <p>
          <strong>Changed your mind?</strong> Cancel and ask for a refund within {CANCEL_REFUND_HOURS} hours of a
          charge, and that charge is refunded in full. The time on your Dodo Payments receipt counts. After{" "}
          {CANCEL_REFUND_HOURS} hours, cancelling stops future charges but doesn&apos;t refund the current month.
        </p>
      </LegalSection>

      <LegalSection n="04" title="When you get a refund">
        <p>
          Outside the {CANCEL_REFUND_HOURS}-hour window above, a monthly payment is <strong>not refunded</strong>,
          including for the rest of a month after you cancel. The exceptions are the times we fall short, so the{" "}
          {CANCEL_REFUND_HOURS}-hour window doesn&apos;t apply to them. You get your money back when:
        </p>
        <ul>
          <li>
            <strong>Your logo isn&apos;t placed.</strong> If it isn&apos;t live within 14 days of your payment and
            your details being sent, that month is refunded in full.
          </li>
          <li>
            <strong>You&apos;re declined.</strong> The author may decline a sponsor whose brand conflicts with the
            project, for example gambling, adult content or anything that breaks the{" "}
            <Link href="/terms">terms of use</Link>. The payment is refunded in full.
          </li>
          <li>
            <strong>The author removes you early.</strong> If your placement is taken down mid-month for any reason
            other than misuse (see below), the unused days are refunded.
          </li>
          <li>
            <strong>You&apos;re charged by mistake.</strong> Duplicate charges, or a renewal after a cancellation
            that went through, are refunded in full.
          </li>
          <li>
            <strong>A tier you paid for is retired.</strong> The unused days of that month are refunded.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n="05" title="How to ask">
        <p>
          Email <a href={`mailto:${SPONSOR_EMAIL}`}>{SPONSOR_EMAIL}</a> with the email you paid with and the date
          of the charge. You&apos;ll get a reply within 3 working days, and approved refunds are issued through Dodo
          Payments to your original payment method. They usually reach your account within 5 to 10 business days.
        </p>
        <p>
          A cancellation refund must be asked for within <strong>{CANCEL_REFUND_HOURS} hours of the charge</strong>.
          For the cases in section 04, ask as soon as you notice. Dodo Payments can only refund a payment within{" "}
          {REFUND_WINDOW_DAYS} days of the charge, so after that it can&apos;t be refunded through them. You can also
          contact Dodo Payments directly through the support address on your receipt.
        </p>
      </LegalSection>

      <LegalSection n="06" title="Failed payments and disputes">
        <p>
          If a renewal fails, Dodo Payments puts the sponsorship on hold and emails you to update your payment
          method. The logo comes down if the payment isn&apos;t settled within 7 days.
        </p>
        <p>
          Please email before disputing a charge with your bank. A dispute ends the sponsorship, and a disputed
          payment can&apos;t be refunded through Dodo Payments while the dispute is open.
        </p>
      </LegalSection>

      <LegalSection n="07" title="Removal for misuse">
        <p>
          A logo, link, tagline or offer that turns out to be misleading, unlawful or harmful to visitors is taken down
          straight away. In that case the current month is not refunded and the subscription is cancelled.
        </p>
      </LegalSection>

      <LegalSection n="08" title="Price changes">
        <p>
          If a tier&apos;s price or perks change, existing sponsors are told by email at least 30 days before their
          next billing date. You can cancel before then if the new terms don&apos;t suit you.
        </p>
      </LegalSection>

      <LegalSection n="09" title="Changes to this policy">
        <p>
          This policy may change as sponsorship grows. The date at the top is updated when it does, and the history
          is public in the repository. A change never takes away a refund for a payment made before it.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
