import type { Metadata } from "next"

import { CodeBlock } from "@/components/code-block"
import { InstallCommand } from "@/components/copy-command"
import { Code, DocPage, Note, Pager, Section, Step } from "@/components/docs-prose"

export const metadata: Metadata = {
  title: "Add utilities",
  description: "Add the cn() class helper that every component imports.",
}

const utils = `import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}`

const usage = `import { cn } from "@/lib/utils"

<div className={cn("rounded-xl border p-4", active && "bg-muted", className)} />`

export default function AddUtilitiesPage() {
  return (
    <DocPage
      title="Add utilities"
      description="Components merge their own classes with the ones you pass in. That goes through a small cn() helper built on clsx and tailwind-merge."
    >
      <Section title="Setup">
        <div className="flex flex-col gap-8">
          <Step n="1" title="Install the packages">
            <InstallCommand mode="install" command="clsx tailwind-merge" />
          </Step>
          <Step n="2" title="Create the helper" body="Components import it from @/lib/utils, so keep the path.">
            <CodeBlock code={utils} title="lib/utils.ts" />
          </Step>
          <Step n="3" title="Use it" body="Later classes win, so a className prop can override a component default.">
            <CodeBlock code={usage} title="example.tsx" />
          </Step>
        </div>
      </Section>

      <Section title="Already using shadcn?">
        <Note>
          <Code>shadcn init</Code> creates <Code>lib/utils.ts</Code> and installs both packages. If that file exists,
          there is nothing to do here.
        </Note>
      </Section>

      <Pager
        prev={{ href: "/docs/installation/tailwind", label: "Install Tailwind CSS" }}
        next={{ href: "/docs/installation/cli", label: "CLI" }}
      />
    </DocPage>
  )
}
