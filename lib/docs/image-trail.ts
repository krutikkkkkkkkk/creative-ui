import type { ItemDocs } from "./types"

export const imageTrail: ItemDocs = {
  usage: `import { ImageTrail } from "@/components/image-trail"

const images = [
  { src: "/art/bust.webp", alt: "Marble bust" },
  { src: "/art/muse.webp", alt: "A muse reading" },
  { src: "/art/owl.webp", alt: "An owl on a keyboard" },
]

export function Hero() {
  return (
    <section className="relative h-[80svh] overflow-hidden">
      <ImageTrail images={images} />

      {/* Cards never spawn over the headline and buttons. */}
      <div data-trail-quiet className="relative z-10 mx-auto w-fit pt-24">
        <h1>Timeless craft.</h1>
      </div>
    </section>
  )
}`,
  api: [
    {
      name: "ImageTrail",
      extends: "div",
      props: [
        {
          name: "images",
          type: "{ src: string; alt?: string }[]",
          required: true,
          description: "Images to drop along the pointer path, used in order and looped.",
        },
        { name: "spacing", type: "number", default: "80", description: "Pointer travel in px between two cards. Smaller is denser." },
        { name: "duration", type: "number", default: "1500", description: "Life of one card in ms: rise, hang, drift away." },
        {
          name: "maxCards",
          type: "number",
          default: "14",
          description: "Most cards on screen at once. Cards are recycled, oldest first, so the DOM never grows.",
        },
        {
          name: "tilt",
          type: "number",
          default: "16",
          description: "Largest tilt in degrees, following the direction of travel. `0` keeps cards upright.",
        },
        {
          name: "quietSelector",
          type: "string",
          default: `"[data-trail-quiet]"`,
          description: "Selector for areas inside the parent that never spawn cards, plus half a card of margin.",
        },
        {
          name: "cardClassName",
          type: "string",
          description: "Classes for every card: size, aspect ratio, radius, shadow. Defaults to a 4:5 card, 110 to 168px wide.",
        },
      ],
    },
  ],
  notes: [
    "Place it inside a positioned element (`relative`, `absolute`, `fixed`). It covers that element, listens for pointer moves on it and stays out of the way of clicks.",
    "Give your own content a higher `z-index` to keep it above the trail, or a lower one to let cards pass over it.",
    "Mouse and pen only, so touch scrolling never sprays cards. Images load once the page is idle, and only on devices with a mouse or pen.",
    "Cards move with transform and opacity through the Web Animations API, so the trail costs no layout and no React renders while the pointer moves.",
    "With reduced motion the cards fade in place without rising, tilting or scaling.",
    "The trail is decorative and hidden from assistive tech. Put anything people need to read in the page itself.",
    "In Next.js, pass resized URLs from `getImageProps` (`next/image`) so the trail does not download full-size images.",
  ],
}
