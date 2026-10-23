export const SPONSOR_URL = "https://github.com/sponsors/krutikkkkkkkkk"

export type Tier = "diamond" | "gold" | "silver"

export type Sponsor = {
  name: string
  href: string
  tier: Tier
  /** Path under /public. Falls back to the name when omitted. */
  logo?: string
  tagline?: string
}

/* Add sponsors here. Empty tiers show a "your logo here" slot. */
export const SPONSORS: Sponsor[] = []

export const TIERS: { tier: Tier; label: string; slots: number; summary: string; perks: string[] }[] = [
  {
    tier: "diamond",
    label: "Diamond",
    slots: 1,
    summary: "One sponsor, top billing.",
    perks: [
      "Large logo and tagline in the docs sidebar, on every docs page",
      "Featured first on this page",
      "The only Diamond slot, so no one shares it",
    ],
  },
  {
    tier: "gold",
    label: "Gold",
    slots: 1,
    summary: "One sponsor, a size up from Silver.",
    perks: [
      "Larger logo in the docs sidebar, above Silver, on every docs page",
      "Listed on this page, above Silver",
    ],
  },
  {
    tier: "silver",
    label: "Silver",
    slots: 2,
    summary: "Two sponsors, side by side.",
    perks: ["Logo in the docs sidebar, on every docs page", "Listed on this page"],
  },
]
