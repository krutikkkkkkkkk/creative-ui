import type { Metadata } from "next"

import { CodeBlock } from "@/components/code-block"
import { InstallCommand } from "@/components/copy-command"
import { Code, DocPage, Note, Pager, Section, Step } from "@/components/docs-prose"

export const metadata: Metadata = {
  title: "Install Tailwind CSS",
  description: "Add Tailwind CSS v4 to a Next.js project with the PostCSS plugin.",
}

const postcss = `export default {
  plugins: {
    "@tailwindcss/postcss": {},
  },
}`

const css = `@import "tailwindcss";`

const layout = `import "./globals.css"

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}`

export default function InstallTailwindPage() {
  return (
    <DocPage
      title="Install Tailwind CSS"
      description="Every component is styled with Tailwind CSS v4 utility classes. There is no separate stylesheet to import."
    >
      <Section title="Setup">
        <div className="flex flex-col gap-8">
          <Step n="1" title="Install the packages">
            <InstallCommand mode="install" command="tailwindcss @tailwindcss/postcss postcss" />
          </Step>
          <Step n="2" title="Add the PostCSS plugin" body="Create this file at the project root.">
            <CodeBlock code={postcss} title="postcss.config.mjs" />
          </Step>
          <Step
            n="3"
            title="Import Tailwind"
            body="One line at the top of your global stylesheet. Tailwind v4 needs no tailwind.config.js."
          >
            <CodeBlock code={css} title="app/globals.css" />
          </Step>
          <Step n="4" title="Load the stylesheet" body="Import it once in the root layout so every route gets it.">
            <CodeBlock code={layout} title="app/layout.tsx" />
          </Step>
        </div>
      </Section>

      <Section title="Theme tokens">
        <Note>
          Components use shadcn colour tokens such as <Code>bg-muted</Code> and <Code>text-foreground</Code>. The{" "}
          <Code>shadcn init</Code> step on the CLI page writes those into <Code>globals.css</Code> for you.
        </Note>
      </Section>

      <Pager
        prev={{ href: "/docs/installation/next", label: "Install Next.js" }}
        next={{ href: "/docs/installation/utilities", label: "Add utilities" }}
      />
    </DocPage>
  )
}
