import type { ItemDocs } from "./types"

export const collageFrame: ItemDocs = {
  usage: `import { CollageFrame, CollageFrameOverlay } from "@/components/collage-frame"

export function Feature() {
  return (
    <CollageFrame
      src="https://images.unsplash.com/photo-1576773689115-5cd2b0223523?w=900&q=80&auto=format&fit=crop"
      alt="Pre-Raphaelite painting"
      shape="arch"
      tilt={-3}
      className="aspect-[3/4] w-72"
    >
      <CollageFrameOverlay position="bottom-right" tilt={3}>
        <div className="rounded-xl bg-background p-4 shadow-lg">
          <p className="text-sm font-medium">+24% this quarter</p>
        </div>
      </CollageFrameOverlay>
    </CollageFrame>
  )
}`,
  api: [
    {
      name: "CollageFrame",
      extends: "div",
      props: [
        { name: "src", type: "string", required: true, description: "Image URL." },
        { name: "alt", type: "string", default: `""`, description: "Accessible description. Leave empty for decorative images." },
        {
          name: "shape",
          type: `"arch" | "oval" | "torn" | "museum" | "plain"`,
          default: `"arch"`,
          description: "Cut-out shape.",
        },
        { name: "tilt", type: "number", default: "0", description: "Rotation in degrees, for a pasted-down collage feel." },
        { name: "shadow", type: "boolean", default: "true", description: "Soft drop shadow under the cut-out." },
        { name: "roughness", type: "number", default: "0.5", description: "Torn edge roughness, 0 to 1. `torn` only." },
        { name: "seed", type: "number", default: "7", description: "Seed for the torn edge, so two frames can differ. `torn` only." },
        {
          name: "paperColor",
          type: "string",
          default: `"#f4efe6"`,
          description: "Paper colour that shows along a torn edge. `torn` only.",
        },
        {
          name: "frameColor",
          type: "string",
          default: `"#2a2420"`,
          description: "Frame colour (dark walnut). Try `#b08d4a` for gilt. `museum` only.",
        },
        { name: "matColor", type: "string", default: `"#f3efe7"`, description: "Mat colour. `museum` only." },
        { name: "frameWidth", type: "number", default: "18", description: "Frame thickness in px. `museum` only." },
        { name: "matWidth", type: "number", default: "24", description: "Mat thickness in px. `museum` only." },
        { name: "fit", type: `"cover" | "contain"`, default: `"cover"`, description: "How the image fills the cut-out." },
        { name: "imageClassName", type: "string", description: "Class names for the `img` element." },
        {
          name: "children",
          type: "React.ReactNode",
          description: "Overlay content, usually one or more `CollageFrameOverlay` elements.",
        },
      ],
    },
    {
      name: "CollageFrameOverlay",
      description: "Positions a card or any UI element on top of a `CollageFrame`.",
      extends: "div",
      props: [
        {
          name: "position",
          type: `"top-left" | "top-right" | "bottom-left" | "bottom-right" | "bottom" | "center"`,
          default: `"bottom-left"`,
          description: "Where the overlay sits on the frame.",
        },
        {
          name: "hang",
          type: "number",
          default: "24",
          description: "How far the overlay hangs past the frame edge, in px. Use `0` to keep it inside.",
        },
        {
          name: "tilt",
          type: "number",
          default: "0",
          description: "Counter-rotation in degrees. Pass the negative of the frame's tilt to keep the UI level.",
        },
      ],
    },
  ],
  notes: [
    "Give the frame a size with `className`: a width plus a height or aspect ratio.",
    "The torn edge uses CSS masks and the museum frame uses `color-mix()`, which need a current evergreen browser.",
    "No client JavaScript, so it is safe in React Server Components.",
  ],
}
