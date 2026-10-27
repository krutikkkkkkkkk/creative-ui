import type { ItemDocs } from "./types"

export const marbledPaper: ItemDocs = {
  usage: `import { MarbledPaper } from "@/components/marbled-paper"

export function Endpaper() {
  return (
    <MarbledPaper pattern="stone" seed={7} className="aspect-[4/3] w-96" contentClassName="grid place-items-center">
      <p className="bg-[#f4f1ea] px-6 py-4 font-serif text-2xl">Endpapers</p>
    </MarbledPaper>
  )
}

// A still, combed section background in your own colours. The first colour is the bath.
<MarbledPaper
  pattern="combed"
  colors={["#eef0ea", "#387478", "#1d3a46", "#a9c4bf", "#b08d4a"]}
  speed={0}
  interactive={false}
  className="min-h-96"
>
  <section className="mx-auto max-w-2xl px-6 py-24">...</section>
</MarbledPaper>`,
  api: [
    {
      name: "MarbledPaper",
      extends: "div",
      props: [
        {
          name: "pattern",
          type: `"stone" | "combed" | "nonpareil" | "bouquet"`,
          default: `"stone"`,
          description:
            "`stone` is battal: drops of ink pushed into each other. `combed` is gel-git: raked into stripes, then folded into chevrons. `nonpareil` pulls a fine comb across the stripes. `bouquet` draws the fine comb on a serpentine path.",
        },
        {
          name: "colors",
          type: "string[]",
          default: "marbledPaperPalettes.endpaper",
          description: "Hex colours, 2 to 8. The first is the bath, the rest are dropped onto it as ink.",
        },
        { name: "speed", type: "number", default: "1", description: "Idle drift speed, 0 to 3. `0` holds the sheet still." },
        {
          name: "interactive",
          type: "boolean",
          default: "true",
          description: "Drag through the ink to comb it like a stylus. On touch, horizontal drags comb and vertical drags scroll the page.",
        },
        {
          name: "combStrength",
          type: "number",
          default: "1",
          description: "How much ink the stylus carries, 0 to 2. Faster strokes also pull a wider wake.",
        },
        {
          name: "relax",
          type: "number",
          default: "5",
          description: "Seconds for a stroke to relax halfway back into the pattern. `0` keeps strokes until the sheet changes.",
        },
        {
          name: "scale",
          type: "number",
          default: "1",
          description: "Size of the marbling, 0.5 to 2. Higher shows bigger stones and wider combing.",
        },
        {
          name: "seed",
          type: "number",
          default: "1",
          description: "Seed for the drop layout and comb positions. Change it to marble a new sheet. The same seed gives the same sheet on the server and the client.",
        },
        {
          name: "paper",
          type: "number",
          default: "0.5",
          description: "Paper tooth, pigment mottle and darker drop rims, 0 to 1. `0` gives flat ink.",
        },
        { name: "contentClassName", type: "string", description: "Class names for the wrapper around `children`." },
        { name: "children", type: "React.ReactNode", description: "Content laid over the paper, such as a label or a section." },
      ],
    },
  ],
  exports: [
    {
      signature: "marbledPaperPalettes",
      description: "Four colour sets, `endpaper`, `nocturne`, `tide` and `ochre`, as arrays of hex with the bath first.",
    },
    {
      signature: "marbledPaperPatterns",
      description: "The pattern names in picker order.",
    },
  ],
  notes: [
    "Give the component a size, such as `aspect-[4/3] w-96` or `min-h-96`. The pattern scales with the element, so a wide section shows bigger stones than a card. Lower `scale` to tighten it.",
    "Each pixel is traced back through every drop and comb with the exact, area-preserving maps from Jaffer and Lu's \"Mathematical Marbling\", so edges stay sharp at any size. Strokes are stored in a separate displacement field.",
    "It uses WebGL2, or WebGL1 where that is all there is, and needs no float textures. Without WebGL it draws a still copy of the same sheet on a 2D canvas. A lost GPU context shows that copy until the context comes back.",
    "Rendering pauses off screen and in background tabs. Idle drift draws at 30fps; strokes draw every frame. Resolution is capped at 2 million pixels and steps down if frames run long.",
    "With reduced motion the sheet holds still and strokes stay where they are drawn instead of relaxing. Dragging still combs, since the ink only moves under your hand.",
    "The surface is decorative: the canvas is hidden from assistive tech and adds no tab stop, so keyboard users lose nothing. Drags that start on links, buttons or form fields are left alone.",
    "Colours are read as hex. CSS variables and named colours are not supported.",
  ],
}
