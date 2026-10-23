export const SPONSOR_URL = "https://github.com/sponsors/krutikkkkkkkkk"

export type Tier = "diamond" | "gold" | "silver"

export type Sponsor = {
  name: string
  href: string
  tier: Tier
  /** Path under /public. Falls back to the name when omitted. */
  logo?: string
  /** Diamond only: a short offer for creative-ui users, shown under the logo. */
  offer?: string
}

/* Add sponsors here. Empty tiers show a "your logo here" slot. */
export const SPONSORS: Sponsor[] = []

/* Prices are USD per month, billed through GitHub Sponsors. */
export const TIERS: { tier: Tier; label: string; price: number; slots: number; summary: string; perks: string[] }[] = [
  {
    tier: "diamond",
    label: "Diamond",
    price: 250,
    slots: 1,
    summary: "One sponsor, top billing.",
    perks: [
      "Large logo and your offer in the docs sidebar, on every docs page",
      "Featured first on this page",
      "The only Diamond slot, so no one shares it",
    ],
  },
  {
    tier: "gold",
    label: "Gold",
    price: 150,
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
    price: 50,
    slots: 2,
    summary: "Two sponsors, side by side.",
    perks: ["Logo in the docs sidebar, on every docs page", "Listed on this page"],
  },
]
