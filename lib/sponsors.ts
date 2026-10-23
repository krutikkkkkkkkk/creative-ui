/* Where every "become a sponsor" link points. Checkout starts from the tier cards. */
export const SPONSOR_URL = "/sponsor#tiers"

/* Where sponsors send billing and refund questions. */
export const SPONSOR_EMAIL = "krutik@infinitylinkage.com"

/* Launch offer, pre-applied at checkout. The code must exist in the Dodo dashboard, in test and
   live mode, as a 30% percentage discount limited to 3 subscription cycles. Set to null to end
   the offer and every price on the site goes back to full. */
export const LAUNCH_OFFER: { code: string; percent: number; months: number } | null = {
  code: "CREATIVEUI",
  percent: 30,
  months: 3,
}

/** A tier's monthly price while the launch offer runs, in whole dollars. */
export function offerPrice(price: number) {
  return LAUNCH_OFFER ? Math.round(price * (1 - LAUNCH_OFFER.percent / 100)) : price
}

export type Tier = "diamond" | "gold" | "silver"

export type Sponsor = {
  name: string
  href: string
  tier: Tier
  /** Path under /public. Falls back to the name when omitted. */
  logo?: string
  /** Diamond only: an optional tagline or offer, shown under the logo. */
  offer?: string
}

/* Add sponsors here. Empty tiers show a "your logo here" slot. */
export const SPONSORS: Sponsor[] = []

/* Prices are USD per month, billed through Dodo Payments. Slots stack as a pyramid:
   one Diamond on top, two Gold, three Silver. productId is the matching subscription product
   in the Dodo dashboard; test mode and live mode have separate ids. */
export const TIERS: {
  tier: Tier
  label: string
  price: number
  slots: number
  productId: string
  summary: string
  perks: string[]
}[] = [
  {
    tier: "diamond",
    label: "Diamond",
    price: 250,
    slots: 1,
    productId: "pdt_0NqO4K1I6zVwCjSJLnDWr",
    summary: "One sponsor, top billing.",
    perks: [
      "Large logo in the docs sidebar, on every docs page",
      "Your tagline or offer under the logo, in the docs sidebar and on this page",
      "Featured first on this page",
      "The only Diamond slot, so no one shares it",
    ],
  },
  {
    tier: "gold",
    label: "Gold",
    price: 150,
    slots: 2,
    productId: "pdt_0NqO4XrGKEBEIHtpQgMDX",
    summary: "Two sponsors, a size up from Silver.",
    perks: [
      "Larger logo in the docs sidebar, above Silver, on every docs page",
      "Listed on this page, above Silver",
    ],
  },
  {
    tier: "silver",
    label: "Silver",
    price: 50,
    slots: 3,
    productId: "pdt_0NqO4jBQLIkxCt2oS3iFD",
    summary: "Three sponsors, side by side.",
    perks: ["Logo in the docs sidebar, on every docs page", "Listed on this page"],
  },
]
