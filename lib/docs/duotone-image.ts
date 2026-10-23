import type { ItemDocs } from "./types"

export const duotoneImage: ItemDocs = {
  usage: `import Image from "next/image"
import { DuotoneImage } from "@/components/duotone-image"

export function Cover() {
  return (
    <DuotoneImage
      src="/portrait.jpg"
      alt="Portrait"
      preset="riso"
      offset={3}
      className="aspect-square w-72 rounded-xl"
    />
  )
}

// Or filter an element you already render:
<DuotoneImage shadow="#0a2a6e" highlight="#dbe7f5" className="w-72">
  <Image src="/portrait.jpg" alt="Portrait" width={600} height={600} />
</DuotoneImage>`,
  api: [
    {
      name: "DuotoneImage",
      extends: "div",
      props: [
        { name: "src", type: "string", description: "Image URL. Omit when wrapping your own element with `children`." },
        { name: "alt", type: "string", default: `""`, description: "Accessible description. Leave empty for decorative images." },
        {
          name: "preset",
          type: `"riso" | "newsprint" | "cyanotype" | "sepia" | "fluoro" | "forest" | "midnight"`,
          default: `"riso"`,
          description: "A named ink pair. Overridden by `shadow` and `highlight`.",
        },
        {
          name: "shadow",
          type: "string",
          default: "from preset",
          description: "Ink for the shadows. Hex or `rgb()` only.",
        },
        {
          name: "highlight",
          type: "string",
          default: "from preset",
          description: "Ink for the highlights. Hex or `rgb()` only.",
        },
        {
          name: "mix",
          type: "number",
          default: "1",
          description: "Strength of the effect over the original, 0 to 1. Ignored when wrapping `children`.",
        },
        { name: "contrast", type: "number", default: "1.1", description: "Tone contrast before inking, roughly 0.5 to 2." },
        {
          name: "offset",
          type: "number",
          default: "0",
          description: "Riso-style misregistration: offsets a second pass of the shadow ink by this many px.",
        },
        { name: "offsetAngle", type: "number", default: "30", description: "Direction of the misregistration in degrees." },
        { name: "fit", type: `"cover" | "contain"`, default: `"cover"`, description: "How the image fills the box." },
        { name: "imageClassName", type: "string", description: "Class names for the `img` element." },
        {
          name: "children",
          type: "React.ReactNode",
          description: "Filter an existing element, such as `next/image`, instead of rendering an `img`.",
        },
      ],
    },
  ],
  exports: [
    {
      signature: "duotonePresets",
      description: "The seven ink pairs as `{ shadow, highlight }` hex values, for building your own picker.",
    },
    {
      signature: "parseColor(input)",
      description: "Parses `#rgb`, `#rrggbb`, `#rrggbbaa`, `rgb()` and `rgba()` into 0 to 1 channels, or `null`.",
    },
  ],
  notes: [
    "Inks are baked into an SVG filter, so CSS variables and named colours are not supported. An unreadable shadow falls back to black and an unreadable highlight to white.",
    "`offset` adds a second copy of the image. `mix` below 1 adds one more.",
    "No client JavaScript, so it is safe in React Server Components.",
  ],
}
