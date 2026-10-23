import type { Metadata } from "next"

import { CodeBlock } from "@/components/code-block"
import { InstallCommand } from "@/components/copy-command"
import { Code, DocPage, Note, Pager, Section, Step } from "@/components/docs-prose"

export const metadata: Metadata = {
  title: "Install Next.js",
  description: "Create a Next.js app with the App Router, TypeScript and Tailwind CSS.",
}

const prompts = `Would you like to use TypeScript? ... Yes
Would you like to use ESLint? ... Yes
Would you like to use Tailwind CSS? ... Yes
Would you like your code inside a src/ directory? ... No
Would you like to use App Router? ... Yes
Would you like to use Turbopack? ... Yes
Would you like to customize the import alias (@/* by default)? ... No`

export default function InstallNextPage() {
  return (
    <DocPage
      title="Install Next.js"
      description="creative-ui components are React components built for the Next.js App Router. Start from a fresh app, or skip ahead if you already have one."
    >
      <Section title="Create a new project">
        <div className="flex flex-col gap-8">
          <Step n="1" title="Run create-next-app" body="Replace my-app with your project name.">
            <InstallCommand mode="create" command="next-app@latest my-app" />
          </Step>
          <Step
            n="2"
            title="Answer the prompts"
            body="Say yes to TypeScript, Tailwind CSS and the App Router. Keep the default @/* import alias."
          >
            <CodeBlock code={prompts} title="Terminal" />
          </Step>
          <Step n="3" title="Start the dev server">
            <InstallCommand mode="run" command="dev" />
          </Step>
        </div>
        <Note className="mt-6 text-sm text-muted-foreground">
          Choosing Tailwind in the prompts already does the next step for you. If you did, go straight to{" "}
          <Code>Add utilities</Code>.
        </Note>
      </Section>

      <Section title="Existing project">
        <Note>
          Any React project with Tailwind CSS v4 works. Components import from <Code>@/components</Code> and{" "}
          <Code>@/lib/utils</Code>, so make sure <Code>tsconfig.json</Code> maps <Code>@/*</Code> to the project root.
        </Note>
      </Section>

      <Pager
        prev={{ href: "/docs", label: "Introduction" }}
        next={{ href: "/docs/installation/tailwind", label: "Install Tailwind CSS" }}
      />
    </DocPage>
  )
}
