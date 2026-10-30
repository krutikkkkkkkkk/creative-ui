import type { Metadata } from "next"

import { LegalPage, LegalSection } from "@/components/legal-page"
import { pageMetadata } from "@/lib/seo"
import { SPONSOR_EMAIL } from "@/lib/sponsors"

export const metadata: Metadata = pageMetadata({
  title: "Privacy policy",
  description: "What creative-ui collects when you visit, which is very little, and why.",
  path: "/privacy",
})

const UPDATED = "24 Oct 2026"

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy policy"
      title={
        <>
          We count visitors. <span className="text-muted-foreground">That is about it.</span>
        </>
      }
      updated={UPDATED}
      intro="creative-ui is a free, open-source registry of components and Claude skills. There are no accounts, no advertising and no tracking pixels. This page explains the little data the site does handle."
    >
      <LegalSection n="01" title="Who runs this site">
        <p>
          This site, ui.krutikraut.com, is run by Krutik Raut as an open-source project of{" "}
          <a href="https://www.infinitylinkage.com" target="_blank" rel="noreferrer">
            Infinity Linkage
          </a>
          . The source code,
          including everything described on this page, is public on{" "}
          <a href="https://github.com/krutikkkkkkkkk/creative-ui" target="_blank" rel="noreferrer">
            GitHub
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection n="02" title="The visitor counter">
        <p>
          The header shows how many unique browsers have visited. To make that work, the site generates a random
          identifier the first time you visit and stores it in your browser&apos;s local storage. That identifier is
          sent to the site once per visit and added to a probabilistic counter (a HyperLogLog) stored with Upstash
          Redis.
        </p>
        <ul>
          <li>The identifier is random. It is not derived from your IP address, device or any account.</li>
          <li>
            The counter only stores a compressed sketch of the identifiers, so individual visits cannot be read back
            out of it, and nothing links the identifier to you.
          </li>
          <li>
            Clearing your browser&apos;s site data removes the identifier. Your next visit is simply counted as a new
            browser.
          </li>
        </ul>
      </LegalSection>

      <LegalSection n="03" title="Preferences stored in your browser">
        <p>
          Your light or dark theme choice is stored in local storage so the site remembers it. It never leaves your
          browser. The site does not set cookies.
        </p>
      </LegalSection>

      <LegalSection n="04" title="Hosting and server logs">
        <p>
          The site is hosted on Vercel. Like any web host, Vercel receives standard request data (IP address,
          browser user agent, requested URL) to deliver pages and protect the service, and may keep short-lived
          logs for that purpose. See{" "}
          <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noreferrer">
            Vercel&apos;s privacy policy
          </a>
          . The site itself does not run analytics.
        </p>
      </LegalSection>

      <LegalSection n="05" title="Sponsorship payments">
        <p>
          Sponsor checkout runs on{" "}
          <a href="https://dodopayments.com" target="_blank" rel="noreferrer">
            Dodo Payments
          </a>
          , which collects your card and billing details under its own privacy policy. This site never sees your
          card. Before checkout, the details form saves what you send in it (your logo, link, offer, contact name
          and email) in Redis. If you don&apos;t complete the payment, those details are deleted after 7 days.
          After payment, Dodo Payments sends back the subscription&apos;s status, tier, name and email, which are
          kept with your details to manage your placement. Email{" "}
          <a href={`mailto:${SPONSOR_EMAIL}`}>{SPONSOR_EMAIL}</a> to have them removed once a sponsorship ends.
        </p>
      </LegalSection>

      <LegalSection n="06" title="Third-party content">
        <p>
          Some component previews in the docs load sample artwork from Unsplash. When those images load, your
          browser requests them directly from Unsplash, which then sees your IP address under{" "}
          <a href="https://unsplash.com/privacy" target="_blank" rel="noreferrer">
            Unsplash&apos;s privacy policy
          </a>
          . Links to GitHub and other sites are subject to those sites&apos; own policies.
        </p>
      </LegalSection>

      <LegalSection n="07" title="Installing items with the CLI">
        <p>
          When you run <strong>npx shadcn add</strong> with a URL from this registry, your machine fetches a static
          JSON file from this site. Nothing about your project is sent back. The shadcn CLI itself is maintained by
          shadcn and has its own{" "}
          <a href="https://ui.shadcn.com/docs/cli" target="_blank" rel="noreferrer">
            documentation
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection n="08" title="Children">
        <p>The site is not directed at children under 13 and does not knowingly collect information from them.</p>
      </LegalSection>

      <LegalSection n="09" title="Changes and contact">
        <p>
          If this policy changes, the date at the top is updated and the change is visible in the repository
          history. Questions go to the project&apos;s{" "}
          <a href="https://github.com/krutikkkkkkkkk/creative-ui/issues" target="_blank" rel="noreferrer">
            issue tracker
          </a>
          .
        </p>
      </LegalSection>
    </LegalPage>
  )
}
