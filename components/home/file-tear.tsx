"use client"

import * as React from "react"

import { TearReveal } from "@/registry/new-york/blocks/tear-reveal/tear-reveal"

/* "What you get is a file", shown rather than said: a paper wrapper printed with the item's
   name, and under it the first lines of the source the CLI writes. Tearing it open is the
   registry's own tear-reveal. */

export function FileTear({
  name,
  file,
  lines,
  totalLines,
}: {
  name: string
  /** Where the file lands, e.g. components/halftone-image.tsx. */
  file: string
  /** The opening lines of the source. */
  lines: string[]
  totalLines: number
}) {
  const [torn, setTorn] = React.useState(false)
  const [seed, setSeed] = React.useState(5)

  return (
    <div className="w-full max-w-[400px]">
      <TearReveal
        direction="down"
        paper="#f4f1ea"
        seed={seed}
        torn={torn}
        onTear={() => setTorn(true)}
        label={`Tear open ${name}`}
        cover={
          <div className="absolute inset-3 flex flex-col justify-between border border-current/25 p-5">
            <p className="flex justify-between font-mono text-[10px] tracking-[.08em] uppercase opacity-70">
              <span>@creative-ui</span>
              <span>1 file</span>
            </p>
            <div>
              <p className="font-serif text-4xl leading-[0.95] tracking-[-0.02em]">{name}</p>
              <p className="mt-3 font-mono text-[10px] tracking-[.08em] uppercase opacity-70">
                {totalLines} lines of React · no package · MIT
              </p>
            </div>
            <p className="font-mono text-[10px] tracking-[.08em] uppercase opacity-70">
              Drag down from the notch to open
            </p>
          </div>
        }
        className="aspect-[4/5] w-full shadow-[0_22px_44px_-22px_rgb(0_0_0/0.5)]"
      >
        <div className="flex size-full flex-col bg-[#16130f] font-mono text-[10.5px] leading-[1.6] text-[#e9e2d2]">
          <p className="flex justify-between border-b border-white/10 px-4 py-2.5 text-[10px] tracking-[.04em] text-white/55">
            <span>{file}</span>
            <span>{totalLines} lines</span>
          </p>
          <pre className="relative min-h-0 flex-1 overflow-hidden px-4 py-3 [mask-image:linear-gradient(to_bottom,black_70%,transparent)]">
            {lines.map((line, i) => (
              <span key={i} className="block whitespace-pre">
                <span className="mr-4 inline-block w-4 text-right text-white/30 select-none">{i + 1}</span>
                {line || " "}
              </span>
            ))}
          </pre>
        </div>
      </TearReveal>

      <p className="mt-4 flex min-h-5 items-baseline justify-between gap-4 font-mono text-[10px] tracking-[.08em] text-muted-foreground uppercase">
        <span>Plate 2 · tear-reveal over {file.split("/").pop()}</span>
        {torn && (
          <button
            type="button"
            className="shrink-0 whitespace-nowrap text-foreground uppercase underline underline-offset-4 transition-transform duration-150 active:scale-[0.97]"
            onClick={() => {
              setTorn(false)
              setSeed((s) => s + 1)
            }}
          >
            Wrap it again
          </button>
        )}
      </p>
    </div>
  )
}
