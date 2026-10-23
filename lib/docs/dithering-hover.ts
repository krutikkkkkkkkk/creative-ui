import type { ItemDocs } from "./types"

export const ditheringHover: ItemDocs = {
  usage: `import { DitheringHover } from "@/components/dithering-hover"

export function Hero() {
  return (
    <DitheringHover
      src="https://images.unsplash.com/photo-1566054757965-8c4085344c96?w=900&q=80&auto=format&fit=crop"
      alt="Marble statue"
      zoneSize={260}
      dotSize={4}
      className="aspect-[4/5] w-80 rounded-xl"
    />
  )
}`,
  api: [
    {
      name: "DitheringHover",
      extends: "div",
      props: [
        {
          name: "src",
          type: "string",
          required: true,
          description: "Image URL. Cross-origin images must be served with CORS headers, or the canvas cannot read them.",
        },
        { name: "alt", type: "string", default: `""`, description: "Accessible description. Leave empty for decorative images." },
        { name: "zoneSize", type: "number", default: "240", description: "Diameter of the dithered zone in CSS pixels, 60 to 500." },
        { name: "dotSize", type: "number", default: "4", description: "Size of one dither pixel in CSS pixels, 1 to 16. 2 to 4 reads editorial, 8 to 16 reads graphic." },
        { name: "matrix", type: "2 | 4 | 8", default: "8", description: "Bayer matrix order. 8 gives the smoothest tones, 2 the harshest." },
        {
          name: "dark",
          type: "string",
          default: `"#000"`,
          description: "Ink for dark pixels. Any CSS colour, including `currentColor`.",
        },
        {
          name: "light",
          type: "string",
          default: `"#fff"`,
          description: "Ink for light pixels. Pass `\"transparent\"` to let the photo show through the light pixels.",
        },
        { name: "contrast", type: "number", default: "1", description: "Tone curve steepness, roughly 0.5 to 2." },
        { name: "brightness", type: "number", default: "0", description: "Shift the tones lighter (positive) or darker (negative), -1 to 1." },
        { name: "streaks", type: "number", default: "28", description: "Streaks radiating from the zone. `0` gives a clean ragged circle." },
        { name: "streakLength", type: "number", default: "1", description: "Streak reach as a multiple of the zone radius." },
        { name: "roughness", type: "number", default: "0.6", description: "How ragged the rim and streaks are, 0 to 1." },
        {
          name: "mode",
          type: `"inside" | "outside"`,
          default: `"inside"`,
          description: "`inside` dithers under the cursor. `outside` dithers the whole image and reveals the photo under the cursor.",
        },
        { name: "ease", type: "number", default: "0.2", description: "Pointer follow easing per frame, 0 to 1. `1` snaps, smaller values lag behind." },
        { name: "seed", type: "number", default: "7", description: "Seed for the streak layout. Change it for a different pattern." },
        { name: "fit", type: `"cover" | "contain"`, default: `"cover"`, description: "How the source fills the canvas." },
        {
          name: "crossOrigin",
          type: `"anonymous" | "use-credentials"`,
          default: `"anonymous"`,
          description: "Pass `undefined` for same-origin images that must not send a CORS request.",
        },
        { name: "onRendered", type: "() => void", description: "Called once the image is loaded and first drawn." },
        { name: "children", type: "React.ReactNode", description: "Content layered over the canvas, such as captions or badges." },
      ],
    },
  ],
  exports: [
    {
      signature: "drawDither(canvas, image, width, height, options?)",
      description:
        "The dither on its own, with no cursor and no React. Draws an image, canvas, video or ImageBitmap onto a canvas as a full-frame Bayer dither, so you can export a PNG with `canvas.toBlob()`. Takes `dotSize`, `matrix`, `dark`, `light`, `contrast`, `brightness` and `fit`.",
    },
    {
      signature: "ditherBitmap(image, width, height, options?)",
      description: "Returns the raw 0/1 bitmap at one entry per dither pixel, plus its size, for your own renderers.",
    },
  ],
  notes: [
    "Size it like an image: give it a width with `className`. Without a height or aspect ratio it adopts the source image's aspect ratio once loaded.",
    "The dither is computed once per size and option change and cached. Pointer moves only recomposite the patch around the cursor, so it stays smooth at large sizes.",
    "The zone grows in when the pointer enters and shrinks out when it leaves. Works with touch and pen through pointer events; with reduced motion the zone snaps instead of easing.",
    "Works best on high-contrast photography. Raise `contrast` for flat images.",
    "The canvas gets `role=\"img\"` and your `alt` as its label, or is hidden from assistive tech when `alt` is empty.",
  ],
}
