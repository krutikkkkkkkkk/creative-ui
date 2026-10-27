import type { ItemDocs } from "./types"

export const cyanotype: ItemDocs = {
  usage: `import Image from "next/image"
import { Cyanotype } from "@/components/cyanotype"

export function Plate() {
  return (
    <Cyanotype
      src="https://images.unsplash.com/photo-1576773689115-5cd2b0223523?w=900&q=80&auto=format&fit=crop"
      alt="Pre-Raphaelite painting of a woman in robes"
      develop
      className="aspect-[4/5] w-80"
    />
  )
}

// A photogram: dark or opaque shapes on a light ground print as white silhouettes.
<Cyanotype mode="photogram" border={0} contrast={1.4} seed={8} className="aspect-[4/5] w-80">
  <Image src="/pressed-fern.png" alt="Pressed fern" fill className="object-cover" />
</Cyanotype>`,
  api: [
    {
      name: "Cyanotype",
      extends: "div",
      props: [
        { name: "src", type: "string", description: "Image URL. Omit when wrapping your own element with `children`." },
        { name: "alt", type: "string", default: `""`, description: "Accessible description. Leave empty for decorative images." },
        {
          name: "mode",
          type: `"print" | "photogram"`,
          default: `"print"`,
          description:
            "`print` contact-prints the image as a positive. `photogram` treats it as objects laid on the paper: dark or opaque shapes stay white and everything else exposes to blue.",
        },
        {
          name: "preset",
          type: `"classic" | "deep" | "tea" | "faded"`,
          default: `"classic"`,
          description: "A named tone ramp. `tea` is tannin-toned, `faded` is a sun-bleached print. Overridden by `ramp`.",
        },
        {
          name: "ramp",
          type: "string[]",
          description: "Custom tone stops from full exposure to bare paper, as hex. The last stop is also the paper colour.",
        },
        {
          name: "exposure",
          type: "number",
          default: "0",
          description: "-1 to 1. Higher prints darker and deeper, lower leaves it pale.",
        },
        { name: "contrast", type: "number", default: "1.15", description: "Tone contrast, roughly 0.5 to 2." },
        {
          name: "roughness",
          type: "number",
          default: "0.6",
          description: "Ragged, streaky brush edge on the coating, 0 to 1. `0` gives a clean rectangle.",
        },
        { name: "mottle", type: "number", default: "0.4", description: "Uneven coating and exposure, 0 to 1." },
        { name: "texture", type: "number", default: "0.5", description: "Paper tooth over the whole sheet, 0 to 1." },
        { name: "margin", type: "number", default: "24", description: "Bare paper around the brushed coating, in px." },
        {
          name: "border",
          type: "number",
          default: "18",
          description: "Fully exposed blue border between the brush edge and the image, in px. `0` lets the brush edge eat into the image.",
        },
        {
          name: "seed",
          type: "number",
          default: "3",
          description: "Seed for the brush edge and mottle. Give each print in a set its own so the edges differ.",
        },
        {
          name: "develop",
          type: "boolean",
          default: "false",
          description:
            "Wash the print from unexposed yellow-green to blue the first time it scrolls into view. Plays once, and not at all for reduced motion.",
        },
        { name: "developDuration", type: "number", default: "1800", description: "Length of the develop wash in ms." },
        { name: "fit", type: `"cover" | "contain"`, default: `"cover"`, description: "How the image fills the box." },
        { name: "imageClassName", type: "string", description: "Class names for the `img` element." },
        {
          name: "children",
          type: "React.ReactNode",
          description: "Print an existing element, such as `next/image` or an SVG, instead of rendering an `img`.",
        },
      ],
    },
  ],
  exports: [
    {
      signature: "cyanotypePresets",
      description: "The four tone ramps as arrays of hex stops, darkest first, for building your own picker.",
    },
  ],
  notes: [
    "Give the component a size, such as `aspect-[4/5] w-80`. The image fills the area inside `margin` and `border`.",
    "Everything is SVG filters, so cross-origin images work without CORS headers. Nothing is drawn to a canvas.",
    "Ramp colours are baked into the filter, so they must be hex. CSS variables and named colours are not supported.",
    "To replay the develop wash, remount the component with a new `key`.",
    "It is a client component because of the develop wash. Without `develop` it renders the same markup on the server and adds no observers.",
  ],
}
