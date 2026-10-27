import type { ItemDocs } from "./types"

export const goldLeaf: ItemDocs = {
  usage: `import { GoldLeaf } from "@/components/gold-leaf"

export function Title() {
  return (
    <GoldLeaf as="h1" lay className="font-serif text-8xl">
      Aurum
    </GoldLeaf>
  )
}

// Palladium on a book spine, smaller leaves, well worn.
<GoldLeaf tone="white" leafSize={20} cracks={0.7} seed={3} className="font-serif text-4xl italic">
  Ex Libris
</GoldLeaf>`,
  api: [
    {
      name: "GoldLeaf",
      extends: "span",
      props: [
        { name: "as", type: "React.ElementType", default: `"span"`, description: "Element to render, such as `h1`." },
        {
          name: "tone",
          type: `"yellow" | "rose" | "white" | "copper"`,
          default: `"yellow"`,
          description: "The metal. `yellow` is 23k gold, `white` is palladium.",
        },
        {
          name: "leafSize",
          type: "number",
          default: "32",
          description: "Edge of one leaf in px. Seams fall every `leafSize`, so on a title 24 to 48 reads well.",
        },
        {
          name: "cracks",
          type: "number",
          default: "0.3",
          description: "Cracks and missing flecks, 0 to 1. `0` is a fresh, perfect lay. Flecks are see-through, so the ground behind the text shows.",
        },
        { name: "sheen", type: "number", default: "0.85", description: "Strength of the moving highlight, 0 to 1." },
        {
          name: "interactive",
          type: "boolean",
          default: "true",
          description:
            "The highlight follows a mouse or pen anywhere on the page, gliding on a spring. On touch screens a slow pass of light runs every few seconds instead. `false` leaves a still highlight.",
        },
        {
          name: "lay",
          type: "boolean",
          default: "false",
          description:
            "The first time it scrolls into view, the text starts as bare amber size and the leaves settle on in a staggered sweep. Plays once, and not at all for reduced motion.",
        },
        { name: "layDuration", type: "number", default: "1800", description: "Length of the lay in ms." },
        { name: "seed", type: "number", default: "7", description: "Seed for the leaf layout, cracks and flecks." },
      ],
    },
  ],
  exports: [
    {
      signature: "goldLeafTones",
      description: "The four metal ramps (`dark`, `mid`, `light`, `bright` hex stops), for matching borders or rules to the gilt.",
    },
  ],
  notes: [
    "Made for text. The face is `background-clip: text`, so icons or SVG children are not gilded; set them as text or give them a fill from `goldLeafTones`.",
    "The text stays real text: it is selectable, copyable and read once by screen readers. The highlight is an `aria-hidden`, inert copy of the children, so avoid children with ids or state.",
    "The relief is an SVG filter that runs once. The moving highlight is a separate layer, so the pointer only repaints a gradient and never re-runs the filter.",
    "One window `pointermove` listener per instance. The animation loop stops when the light settles, when the element is off screen and when the tab is hidden.",
    "With reduced motion the gilt is still and fully laid, with the highlight resting at the top left.",
    "To replay the lay, remount the component with a new `key`.",
  ],
}
