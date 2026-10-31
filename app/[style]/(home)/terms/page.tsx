import type { Metadata } from "next"
import Link from "next/link"

import { pageMetadata } from "@/lib/seo"
import { LegalPage, LegalSection } from "@/components/legal-page"

export const metadata: Metadata = pageMetadata({
  title: "Terms of use",
  description: "The terms for using the creative-ui website and registry.",
  path: "/terms",
})

const UPDATED = "24 Oct 2026"

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms of use"
      title={
        <>
          Free to use. <span className="text-muted-foreground">Offered as is.</span>
        </>
      }
      updated={UPDATED}
      intro="By using ui.krutikraut.com or installing items from its registry, you agree to these terms. They are short because the project is simple: open-source code, shared freely, with no promises attached."
    >
      <LegalSection n="01" title="The code is MIT licensed">
        <p>
          Every component, skill and the site&apos;s own source code are released under the MIT License. You can use,
          copy, modify and redistribute them, commercially or not, as long as you keep the license notice. The full
          text is on the <Link href="/license">license page</Link>.
        </p>
      </LegalSection>

      <LegalSection n="02" title="Artwork and written content">
        <p>
          Paintings shown on this site are either reproductions of public-domain works or original images generated
          for the project. The site&apos;s text, layout and generated artwork are © Krutik Raut. You may quote or
          screenshot them to talk about the project. Please don&apos;t reuse the generated artwork as your own
          marketing material. Public-domain reproductions remain public domain.
        </p>
      </LegalSection>

      <LegalSection n="03" title="No warranty">
        <p>
          The site and registry are provided <strong>as is</strong>, without warranty of any kind. Components may
          have bugs, change or be removed. You are responsible for reviewing anything you install and for how it
          behaves in your own project. To the fullest extent permitted by law, the author is not liable for any
          damages arising from use of the site or its contents.
        </p>
      </LegalSection>

      <LegalSection n="04" title="Acceptable use">
        <ul>
          <li>Don&apos;t attempt to disrupt the site, flood its endpoints, or interfere with the visitor counter.</li>
          <li>Don&apos;t misrepresent the project or imply an endorsement by its author.</li>
          <li>Don&apos;t use the name creative-ui or its logo in a way that suggests your work is this project.</li>
        </ul>
      </LegalSection>

      <LegalSection n="05" title="Sponsorship">
        <p>
          Sponsorships are paid through{" "}
          <a href="https://dodopayments.com" target="_blank" rel="noreferrer">
            Dodo Payments
          </a>
          , which acts as merchant of record, and its terms apply to the payment. Sponsor logo placement is described on the <Link href="/sponsor">sponsor page</Link> and is offered in
          good faith. The author may decline or remove a sponsor whose brand conflicts with the project. Billing,
          cancellation and refunds are covered by the <Link href="/refund-policy">refund policy</Link>.
        </p>
      </LegalSection>

      <LegalSection n="06" title="Third-party sites and tools">
        <p>
          The site links to GitHub, Vercel, Unsplash and the shadcn CLI, among others. Those services have their own
          terms and privacy policies, and the author is not responsible for them.
        </p>
      </LegalSection>

      <LegalSection n="07" title="Contributions">
        <p>
          Pull requests are welcome. By contributing code to the repository you agree that it is released under the
          same MIT License as the rest of the project. See the{" "}
          <a href="https://github.com/krutikkkkkkkkk/creative-ui/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer">
            contributing guide
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection n="08" title="Changes">
        <p>
          These terms may change as the project grows. The date at the top is updated when they do, and the history
          is public in the repository. Continuing to use the site after a change means you accept the new terms.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
