import type { ItemDocs } from "./types"

export const duotoneImage: ItemDocs = {
  usage: `import Image from "next/image"
import { DuotoneImage } from "@/components/duotone-image"

export function Cover() {
  return (
    <DuotoneImage
      src="https://images.unsplash.com/photo-1577720643272-265f09367456?w=900&q=80&auto=format&fit=crop"
      alt="Woman carrying a water jar"
      preset="riso"
      offset={3}
      className="aspect-square w-72 rounded-xl"
    />
  )
}

// Slide the shadow pass into register the first time it scrolls into view.
<DuotoneImage src="/poster.jpg" preset="fluoro" offset={2} registration="view" className="aspect-[4/5] w-72" />

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
        {
          name: "registration",
          type: `"static" | "view" | "scroll"`,
          default: `"static"`,
          description:
            "Animate the shadow pass into register, like a riso pull. `view` slides it in once, the first time the image scrolls into view. `scroll` ties it to the image's position in the viewport. It lands on `offset`. Needs `src`.",
        },
        {
          name: "registrationOffset",
          type: "number",
          default: "24",
          description: "How far out of register the pass starts, along `offsetAngle`, in px. It also starts turned by about 0.06° per px.",
        },
        { name: "registrationDuration", type: "number", default: "1200", description: "Length of the `view` slide in ms." },
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
    "`offset` adds a second copy of the image. `mix` below 1 adds one more. `offset` and `registration` need `src` and are ignored when wrapping `children`.",
    "With `registration`, the pass travels on `transform` and `opacity` only. `view` is a CSS transition triggered once; `scroll` writes the transform from `requestAnimationFrame` while the image is on screen, with no React renders.",
    "With reduced motion the pass is in register from the first paint. To replay `view`, remount with a new `key`.",
    "It is a client component because of the registration animation. With the default `registration=\"static\"` it renders the same markup on the server and adds no observers. Import `duotonePresets` and `parseColor` from client code.",
  ],
}
