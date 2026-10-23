import { Eyebrow } from "@/components/home-primitives"

/* Lines of the house style light up word by word as they cross the viewport
   (CSS scroll-driven animation, so there is no JS and nothing to hydrate). */

const LINES = [
  "Loud art, quiet interface.",
  "One metaphor per section, and it has to be literal.",
  "A light serif, tight leading, one accent.",
  "Code you own, not code you rent.",
]

export function Manifesto() {
  return (
    <section className="relative isolate overflow-hidden border-t py-24 sm:py-32">
      <span
        aria-hidden
        className="cc-mega pointer-events-none absolute -right-[4vw] top-1/2 -z-10 -translate-y-1/2 font-serif text-[clamp(10rem,32vw,30rem)] leading-none tracking-[-0.05em] text-foreground/[0.035] italic select-none"
      >
        craft
      </span>
      <div className="mx-auto w-full max-w-5xl px-4 sm:px-8">
        <Eyebrow>The house style</Eyebrow>
        <div className="mt-10 flex flex-col gap-10 sm:gap-14">
          {LINES.map((line, i) => (
            <p
              key={line}
              className="max-w-[22ch] font-serif text-4xl leading-[1.02] tracking-[-0.02em] text-balance sm:text-5xl lg:text-6xl"
            >
              <span className="mr-4 align-top font-mono text-[11px] tracking-[.08em] text-muted-foreground">
                0{i + 1}
              </span>
              {line.split(" ").map((word, j) => (
                <span key={j} className="cc-word">
                  {word}{" "}
                </span>
              ))}
            </p>
          ))}
        </div>
      </div>
    </section>
  )
}
