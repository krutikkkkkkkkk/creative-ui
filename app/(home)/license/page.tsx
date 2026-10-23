import type { Metadata } from "next"
import { promises as fs } from "fs"
import path from "path"

import { pageMetadata } from "@/lib/seo"
import { LegalPage, LegalSection } from "@/components/legal-page"
import { CodeBlock } from "@/components/code-block"

export const metadata: Metadata = pageMetadata({
  title: "License",
  description: "creative-ui is released under the MIT License.",
  path: "/license",
})

export default async function LicensePage() {
  const license = await fs.readFile(path.join(process.cwd(), "LICENSE"), "utf8")

  return (
    <LegalPage
      eyebrow="License"
      title={
        <>
          MIT. <span className="text-muted-foreground italic">Keep the notice, do the rest.</span>
        </>
      }
      updated="23 Oct 2026"
      intro="Everything in the registry, and the site that serves it, is released under the MIT License. Install it, change it, ship it in a product. The only ask is that the copyright notice travels with the code."
    >
      <LegalSection n="01" title="In plain words">
        <ul>
          <li>You can use the code for anything, including commercial work.</li>
          <li>You can modify it and redistribute your version.</li>
          <li>You must keep the copyright and permission notice in copies of the code.</li>
          <li>It comes with no warranty. If it breaks, the author is not liable.</li>
        </ul>
      </LegalSection>

      <LegalSection n="02" title="The full text">
        <CodeBlock code={license.trim()} title="LICENSE" />
      </LegalSection>

      <LegalSection n="03" title="Artwork">
        <p>
          The MIT License covers the code. Paintings on this site are public-domain reproductions or original
          generated images, as described in the terms of use.
        </p>
      </LegalSection>
    </LegalPage>
  )
}
