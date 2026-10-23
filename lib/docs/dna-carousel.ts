import type { ItemDocs } from "./types"

export const dnaCarousel: ItemDocs = {
  usage: `import { DnaCarousel } from "@/components/dna-carousel"

const images = [
  { src: "/venus.jpg", alt: "The Birth of Venus" },
  { src: "/bust.jpg", alt: "Marble bust" },
  { src: "/painting.jpg", alt: "Classical painting" },
]

export function Gallery() {
  return (
    <DnaCarousel
      images={images}
      aria-label="Classical artworks"
      className="h-[420px] w-full"
    />
  )
}`,
  api: [
    {
      name: "DnaCarousel",
      extends: "div",
      props: [
        {
          name: "images",
          type: "{ src: string; alt?: string }[]",
          required: true,
          description: "Cards to show. Short lists are repeated so the loop fills both sides of the helix.",
        },
        { name: "itemWidth", type: "number", default: "220", description: "Card width in px, before responsive fitting." },
        { name: "itemHeight", type: "number", default: "300", description: "Card height in px, before responsive fitting." },
        { name: "gap", type: "number", default: "20", description: "Extra space between neighbouring cards along the helix axis, in px." },
        { name: "radius", type: "number", default: "14", description: "Card corner radius in px." },
        { name: "depth", type: "number", default: "260", description: "How far the back strand sits behind the front strand, in px." },
        { name: "curve", type: "number", default: "24", description: "Extra helix twist per card, in degrees. `0` gives a flat zig-zag." },
        { name: "spread", type: "number", default: "70", description: "Vertical distance between the two strands, in px." },
        { name: "perspective", type: "number", default: "1100", description: "CSS perspective distance in px. Lower is more dramatic." },
        { name: "rotation", type: "number", default: "22", description: "Y-axis rotation per card away from the centre, in degrees." },
        { name: "tilt", type: "number", default: "-6", description: "Tilt of the whole helix axis, in degrees." },
        { name: "activeScale", type: "number", default: "1", description: "Scale of the centred card." },
        { name: "inactiveScale", type: "number", default: "0.8", description: "Scale of the other cards." },
        { name: "blur", type: "number", default: "1.5", description: "Blur in px per card of distance from the centre." },
        {
          name: "rgbSplit",
          type: "number",
          default: "1.5",
          description: "Chromatic-aberration offset in px. Grows with distance and scroll speed.",
        },
        { name: "inactiveOpacity", type: "number", default: "0.5", description: "Opacity of cards away from the centre, 0 to 1." },
        { name: "shadow", type: "boolean", default: "true", description: "Drop shadow under each card." },
        { name: "shadowStrength", type: "number", default: "0.35", description: "Shadow opacity, 0 to 1." },
        { name: "dragSensitivity", type: "number", default: "1", description: "Multiplier on drag distance. Higher moves more cards per swipe." },
        {
          name: "inertia",
          type: "number",
          default: "0.93",
          description: "Momentum kept per frame after a flick, 0 to 1. Higher coasts longer.",
        },
        { name: "snapStrength", type: "number", default: "0.14", description: "How quickly cards settle into place, 0 to 1." },
        {
          name: "autoplay",
          type: "boolean",
          default: "true",
          description: "Drift on its own. Resumes 2.5 s after the user stops interacting.",
        },
        {
          name: "autoplaySpeed",
          type: "number",
          default: "0.35",
          description: "Autoplay speed in cards per second. Negative values run backwards.",
        },
        { name: "pauseOnHover", type: "boolean", default: "true", description: "Pause autoplay while a mouse is over the carousel." },
        { name: "wheel", type: "boolean", default: "true", description: "Scroll the carousel with the mouse wheel or trackpad while hovering it." },
        { name: "grabCursor", type: "boolean", default: "true", description: "Show grab and grabbing cursors." },
        { name: "visibleItems", type: "number", default: "4", description: "How many cards stay visible on each side of the active one." },
        {
          name: "onIndexChange",
          type: "(index: number) => void",
          description: "Called with the index into `images` of the card that becomes active.",
        },
        {
          name: "aria-label",
          type: "string",
          default: `"Image carousel"`,
          description: "Name announced for the carousel region.",
        },
      ],
    },
  ],
  notes: [
    "Give it a height with `className`. Cards are absolutely positioned, and the helix scales down to fit smaller containers.",
    "Focusable, with arrow-key navigation. The active card's `alt` is announced through a polite live region.",
    "With reduced motion, autoplay, blur and the RGB split are off and cards settle faster.",
    "Stops animating while scrolled out of view.",
  ],
}
