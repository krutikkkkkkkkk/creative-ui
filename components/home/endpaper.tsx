"use client"

import * as React from "react"

import { MarbledPaper } from "@/registry/new-york/blocks/marbled-paper/marbled-paper"
import { WaxSeal } from "@/registry/new-york/blocks/wax-seal/wax-seal"

/* The back endpaper: a sheet of marbled-paper with a label pasted on it and a wax-seal that
   does something useful. Holding the seal copies the command that installs it. */

export function Endpaper({ command }: { command: string }) {
  const [sealed, setSealed] = React.useState(false)
  const [copied, setCopied] = React.useState(false)

  return (
    <MarbledPaper
      pattern="stone"
      speed={0.6}
      seed={11}
      data-preview=""
      className="aspect-[4/3] w-full overflow-hidden ring-1 ring-black/10 modern:rounded-[24px]"
      contentClassName="flex items-center justify-center p-6"
    >
      <div className="flex flex-col items-center border border-[#241d17]/25 bg-[#f4f1ea] px-9 pt-6 pb-5 text-center text-[#241d17] shadow-md">
        <WaxSeal
          color="oxblood"
          size={80}
          sealed={sealed}
          resetOnClick
          label="Hold to copy"
          sealedLabel={copied ? "Copied" : "Sealed"}
          hint="Press and hold to copy the install command for the wax seal"
          onSealedChange={(next) => {
            setSealed(next)
            if (!next) return setCopied(false)
            // Still inside the press, so the clipboard accepts the write.
            navigator.clipboard?.writeText(command).then(
              () => setCopied(true),
              () => setCopied(false)
            )
          }}
        >
          <span className="font-serif text-[1.45em]">C</span>
        </WaxSeal>
      </div>
    </MarbledPaper>
  )
}
