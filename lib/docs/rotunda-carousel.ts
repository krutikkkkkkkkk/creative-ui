import type { ItemDocs } from "./types"

export const rotundaCarousel: ItemDocs = {
  usage: `import { RotundaCarousel } from "@/components/rotunda-carousel"

const items = [
  { src: "/gallery/bust.webp", alt: "Marble bust", href: "/work/bust" },
  { src: "/gallery/temple.webp", alt: "Round temple" },
  { src: "/gallery/reel.mp4", poster: "/gallery/reel.jpg", alt: "Studio reel" },
  { src: "/gallery/amphora.webp", alt: "Greek amphora" },
]

export function Gallery() {
  return (
    <RotundaCarousel
      items={items}
      aria-label="Selected work"
      className="h-[520px] w-full"
    />
  )
}`,
  api: [
    {
      name: "RotundaCarousel",
      extends: "div",
      props: [
        {
          name: "items",
          type: "{ src: string; alt?: string; type?: \"image\" | \"video\"; poster?: string; href?: string; target?: \"_self\" | \"_blank\" }[]",
          required: true,
          description:
            "Tiles around the ring. Videos are detected by extension (or `type`) and play muted and looped. `href` turns a tile into a link.",
        },
        { name: "radius", type: "number", default: "240", description: "Ring radius in px to tile centres, before responsive fitting." },
        { name: "maxSize", type: "number", default: "150", description: "Tile size at the focus angle, in px. Tiles are square." },
        { name: "minSize", type: "number", default: "56", description: "Tile size opposite the focus angle, in px." },
        {
          name: "taper",
          type: "number",
          default: "1.4",
          description: "How sharply tiles shrink away from the focus. `1` is a smooth cosine; higher keeps only the focus tile large.",
        },
        {
          name: "focusAngle",
          type: "number",
          default: "180",
          description: "Where the largest tile sits, in degrees clockwise from 12 o'clock. `180` is the bottom.",
        },
        { name: "minOpacity", type: "number", default: "0.55", description: "Opacity of the smallest tiles, 0 to 1." },
        { name: "cornerRadius", type: "number", default: "16", description: "Tile corner radius in px at the largest size. Scales down with the tile." },
        { name: "objectFit", type: `"cover" | "contain"`, default: `"cover"`, description: "How media is cropped inside each tile." },
        {
          name: "orientation",
          type: `"upright" | "radial"`,
          default: `"upright"`,
          description: "`upright` keeps tiles level; `radial` turns them with the ring like spokes.",
        },
        { name: "shadow", type: "boolean", default: "true", description: "Drop shadow that deepens on larger tiles." },
        {
          name: "minItems",
          type: "number",
          default: "8",
          description: "Repeats `items` in whole passes until the ring has at least this many tiles.",
        },
        { name: "autoSpin", type: "boolean", default: "true", description: "Rotate on its own. Flicks coast and blend back into the spin." },
        { name: "speed", type: "number", default: "10", description: "Auto-spin speed in degrees per second." },
        { name: "direction", type: `"clockwise" | "counterclockwise"`, default: `"clockwise"`, description: "Auto-spin direction." },
        { name: "pauseOnHover", type: "boolean", default: "true", description: "Ease the spin to a stop while a mouse is over the ring." },
        { name: "hoverScale", type: "number", default: "1.18", description: "Scale of the tile under the pointer or keyboard focus. `1` turns it off." },
        { name: "glide", type: "number", default: "0.95", description: "Momentum kept per frame after a flick or wheel spin, 0 to 1. Higher coasts longer." },
        { name: "smoothing", type: "number", default: "0.25", description: "Lag between the pointer and the ring while dragging, 0 to 0.95." },
        { name: "draggable", type: "boolean", default: "true", description: "Spin the ring by dragging around its centre." },
        { name: "dragSensitivity", type: "number", default: "1", description: "Multiplier on drag and wheel rotation." },
        { name: "wheel", type: "boolean", default: "true", description: "Spin the ring with the mouse wheel or trackpad while hovering it." },
        { name: "grabCursor", type: "boolean", default: "true", description: "Show grab and grabbing cursors." },
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
    "Give it a height with `className`. The ring is centred in the box and scales down to fit smaller containers.",
    "Built for square media: tiles are always square and crop with `objectFit`.",
    "Dragging follows the pointer's angle around the centre, so it works from any side of the ring. On touch, vertical swipes still scroll the page.",
    "Focusable, with arrow keys stepping one tile. Linked tiles are reachable with Tab and enlarge on focus. Repeated passes from `minItems` are hidden from screen readers.",
    "With reduced motion, auto-spin is off. Stops animating while scrolled out of view.",
  ],
}
