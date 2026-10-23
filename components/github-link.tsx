import { HugeiconsIcon } from "@hugeicons/react"
import { GithubIcon } from "@hugeicons/core-free-icons"

import { Button } from "@/components/ui/button"

const GITHUB_URL = "https://github.com/krutikkkkkkkkk/creative-ui"

const compact = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 })

/* The nav's GitHub button, with the star count beside the icon once it is known. */
export function GithubLink({ stars }: { stars: number | null }) {
  if (stars === null) {
    return (
      <Button variant="ghost" size="icon" className="size-8" asChild>
        <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label="GitHub">
          <HugeiconsIcon icon={GithubIcon} className="size-4" strokeWidth={2} />
        </a>
      </Button>
    )
  }
  return (
    <Button variant="ghost" size="sm" className="h-8 gap-1.5 px-2 font-normal" asChild>
      <a href={GITHUB_URL} target="_blank" rel="noreferrer" aria-label={`GitHub, ${stars} stars`}>
        <HugeiconsIcon icon={GithubIcon} className="size-4" strokeWidth={2} />
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{compact.format(stars)}</span>
      </a>
    </Button>
  )
}
