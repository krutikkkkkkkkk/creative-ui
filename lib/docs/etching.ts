import type { ItemDocs } from "./types"

export const etching: ItemDocs = {
  usage: `import { Etching } from "@/components/etching"

export function Plate() {
  return (
    <Etching
      src="/marble-bust.webp"
      alt="Marble bust of a woman in profile"
      className="aspect-[4/5] w-80"
    />
  )
}

// Finer lines in oxblood, straight-ruled, drawn as the reader scrolls.
<Etching src="/still-life.jpg" lineSpacing={3} curve={0} ink="#6e2a24" progress={scrollProgress} className="w-full" />`,
  api: [
    {
      name: "Etching",
      extends: "div",
      props: [
        {
          name: "src",
          type: "string",
          required: true,
          description: "Image URL. Cross-origin images must be served with CORS headers, or the canvas cannot read them.",
        },
        { name: "alt", type: "string", default: `""`, description: "Accessible description. Leave empty for decorative images." },
        {
          name: "lineSpacing",
          type: "number",
          default: "4",
          description: "Gap between hatch lines in CSS px. Smaller is finer and takes longer to lay out.",
        },
        { name: "angle", type: "number", default: "35", description: "Angle of the first pass of lines, in degrees." },
        {
          name: "curve",
          type: "number",
          default: "0.5",
          description: "How much the lines bow and swerve around the light and shadow of the image, 0 to 1. `0` is ruled straight.",
        },
        {
          name: "layers",
          type: "1 | 2 | 3",
          default: "3",
          description:
            "Passes of the burin. `1` hatches only. `2` adds cross-hatching in the darker tones. `3` adds a third pass in the deepest shadows.",
        },
        { name: "ink", type: "string", default: `"#241d17"`, description: "Ink colour. Any CSS colour, or `currentColor` to follow the theme." },
        { name: "paper", type: "string", default: `"#f4f1ea"`, description: "Paper colour, or `transparent`." },
        {
          name: "draw",
          type: "boolean",
          default: "true",
          description:
            "Cut the lines in the first time it scrolls into view: the first pass, then the cross-hatching, stroke by stroke. Plays once, pauses off screen, and not at all for reduced motion.",
        },
        { name: "duration", type: "number", default: "2600", description: "Length of the engraving in ms." },
        {
          name: "progress",
          type: "number",
          description: "Controlled progress, 0 to 1, for driving it from scroll or a slider. When set, it replaces the scroll-in animation.",
        },
        { name: "fit", type: `"cover" | "contain"`, default: `"cover"`, description: "How the image fills the plate." },
        { name: "seed", type: "number", default: "5", description: "Seed for the hand tremor and the stroke order." },
        {
          name: "crossOrigin",
          type: `"anonymous" | "use-credentials"`,
          default: `"anonymous"`,
          description: "Pass `undefined` for same-origin images that must not send a CORS request.",
        },
        { name: "children", type: "React.ReactNode", description: "Content layered over the plate, such as a caption." },
      ],
    },
  ],
  notes: [
    "Without an `aspect-*` class or a height it takes the image's own aspect ratio once the image loads.",
    "It draws to a canvas, so the image must be same-origin or served with CORS headers. If the pixels cannot be read, it leaves bare paper and logs a warning.",
    "Each frame inks only the newly cut stretch of each line, so the animation costs about the same as drawing the plate once. Moving `progress` backwards redraws from blank paper.",
    "Images with a clear subject and a plain ground read best. Busy photos turn into dense cross-hatching at small sizes; raise `lineSpacing` or lower `layers`.",
    "Changing an option after the engraving has played redraws it at once instead of replaying. To replay, remount the component with a new `key`.",
    "The canvas has `role=\"img\"` and `alt` as its label. With an empty `alt` it is hidden from assistive tech.",
  ],
}
