import type { ItemDocs } from "./types"

export const billowGallery: ItemDocs = {
  usage: `import { BillowGallery } from "@/components/billow-gallery"

const prints = [
  { src: "/prints/muse.webp", alt: "A muse reading her phone" },
  { src: "/prints/temple.webp", alt: "Ruined temple at golden hour", aspect: 0.8 },
  { src: "/prints/owl.webp", alt: "An owl on an old keyboard", href: "/prints/owl" },
]

export function Wall() {
  return <BillowGallery items={prints} className="h-[600px] w-full bg-[#e9ebef]" />
}

// Stiffer paper, a bigger swell, no drift, and a callback instead of links.
<BillowGallery items={prints} bend={0.6} crest={1.8} drift={0} onSelect={(item) => open(item)} />`,
  api: [
    {
      name: "BillowGallery",
      extends: "div",
      props: [
        {
          name: "items",
          type: "BillowGalleryItem[]",
          required: true,
          description:
            "`{ src, alt?, aspect?, href?, target? }`. `aspect` is width over height; images are cropped to fill. Without it, cards cycle through a few portrait shapes. Items repeat to fill the wall.",
        },
        { name: "columnWidth", type: "number", default: "260", description: "Card width in px. Scaled down on containers narrower than 720 px." },
        { name: "gap", type: "number", default: "56", description: "Space between cards in px." },
        { name: "radius", type: "number", default: "10", description: "Card corner radius in px." },
        {
          name: "bend",
          type: "number",
          default: "1",
          description: "How far the sheets bow and twist while the wall moves. They spring back flat with a little flutter when it stops. `0` keeps them flat.",
        },
        {
          name: "crest",
          type: "number",
          default: "1",
          description: "Height of the swell rolling across the wall. `0` stills it.",
        },
        { name: "perspective", type: "number", default: "1100", description: "Camera distance in px. Lower exaggerates the depth." },
        { name: "shadow", type: "boolean", default: "true", description: "Soft shadows that lengthen as a card rides the swell or lifts." },
        {
          name: "shadowColor",
          type: "string",
          default: `"#26303d"`,
          description: "Shadow colour as `#rrggbb`. Also used for the keyboard focus ring. Match it to your wall.",
        },
        {
          name: "drift",
          type: "number",
          default: "18",
          description: "Idle drift in px per second. Eases to a stop while the wall is hovered or focused. `0` turns it off.",
        },
        { name: "draggable", type: "boolean", default: "true", description: "Pan by dragging or swiping, with momentum." },
        { name: "wheel", type: "boolean", default: "true", description: "Pan with the mouse wheel or trackpad while hovering." },
        {
          name: "onSelect",
          type: "(item: BillowGalleryItem, index: number) => void",
          description: "Called when a card is clicked or tapped, not dragged. Cards with `href` also navigate.",
        },
      ],
    },
  ],
  notes: [
    "Give the gallery a height with `className` or `style`. Its background shows between the cards, so set it there too.",
    "The wall is one WebGL canvas. A visually hidden list mirrors the items for screen readers; tabbing to an entry glides its card to the centre, lifts it and rings it. Arrow keys pan the wall when it has focus.",
    "Images from another origin need CORS headers, since they're uploaded as WebGL textures.",
    "Wheel scrolling over the wall pans it instead of the page, and `touch-action: none` makes a swipe pan it on touch screens. Leave room around a tall gallery to scroll past it, or set `wheel={false}`.",
    "With reduced motion there's no swell or drift, bending is cut to a third, and moves settle at once.",
    "Without WebGL it falls back to a plain grid of the images.",
  ],
}
