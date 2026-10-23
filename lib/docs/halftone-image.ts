import type { ItemDocs } from "./types"

export const halftoneImage: ItemDocs = {
  usage: `import { HalftoneImage } from "@/components/halftone-image"

export function Hero() {
  return (
    <HalftoneImage
      src="https://images.unsplash.com/photo-1566054757965-8c4085344c96?w=900&q=80&auto=format&fit=crop"
      alt="Marble statue"
      dotSize={6}
      angle={45}
      color="#1d3fb0"
      className="aspect-[4/5] w-80 rounded-xl"
    />
  )
}`,
  api: [
    {
      name: "HalftoneImage",
      extends: "div",
      props: [
        {
          name: "src",
          type: "string",
          required: true,
          description: "Image URL. Cross-origin images must be served with CORS headers, or the canvas cannot read them.",
        },
        { name: "alt", type: "string", default: `""`, description: "Accessible description. Leave empty for decorative images." },
        { name: "dotSize", type: "number", default: "6", description: "Screen pitch in CSS pixels. Smaller is finer." },
        { name: "angle", type: "number", default: "45", description: "Screen angle in degrees. 45 is the classic print angle." },
        {
          name: "shape",
          type: `"dot" | "line" | "square"`,
          default: `"dot"`,
          description: "Mark used for the screen.",
        },
        {
          name: "color",
          type: "string",
          default: `"currentColor"`,
          description: "Ink colour. Any CSS colour. `currentColor` follows the text colour and re-inks when the theme changes.",
        },
        { name: "background", type: "string", default: `"transparent"`, description: "Paper colour behind the marks." },
        {
          name: "invert",
          type: "boolean",
          default: "false",
          description: "Screen the highlights instead of the shadows, for light ink on dark paper.",
        },
        { name: "contrast", type: "number", default: "1", description: "Tone curve steepness, roughly 0.5 to 2." },
        {
          name: "gain",
          type: "number",
          default: "1.15",
          description: "Largest mark relative to the cell. 1 means marks just touch; above 1 lets shadows close up.",
        },
        { name: "fit", type: `"cover" | "contain"`, default: `"cover"`, description: "How the source fills the canvas." },
        {
          name: "crossOrigin",
          type: `"anonymous" | "use-credentials"`,
          default: `"anonymous"`,
          description: "Pass `undefined` for same-origin images that must not send a CORS request.",
        },
        { name: "onRendered", type: "() => void", description: "Called after each draw." },
        { name: "children", type: "React.ReactNode", description: "Content layered over the halftone, such as captions or badges." },
      ],
    },
  ],
  exports: [
    {
      signature: "drawHalftone(canvas, image, width, height, options?)",
      description:
        "The renderer on its own, with no React. Draws an image, canvas, video or ImageBitmap onto a canvas, so you can export a PNG with `canvas.toBlob()`. Takes the same options as the component; `color` defaults to `#111` here.",
    },
  ],
  notes: [
    "Size it like an image: give it a width with `className`. Without a height or aspect ratio it adopts the source image's aspect ratio once loaded.",
    "Redraws on resize and caps the device pixel ratio at 2 to keep large canvases fast.",
    "The canvas gets `role=\"img\"` and your `alt` as its label, or is hidden from assistive tech when `alt` is empty.",
  ],
}
