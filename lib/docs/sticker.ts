import type { ItemDocs } from "./types"

export const sticker: ItemDocs = {
  usage: `import { Sticker } from "@/components/sticker"

export function Laptop() {
  return (
    <div className="relative h-80 rounded-xl bg-neutral-200">
      <Sticker rotate={-8} label="Holographic star" className="absolute top-8 left-10 w-28">
        <img src="/stickers/star.svg" alt="" />
      </Sticker>
      <Sticker rotate={6} label="Smiley" className="absolute top-24 right-12 w-24">
        <Smiley />
      </Sticker>
    </div>
  )
}

// Any element works. Its painted shape, here a pill, becomes the die cut.
<Sticker border={4} backColor="#d9c4a0">
  <div className="rounded-full bg-teal-700 px-5 py-2 font-serif text-white italic">peel me</div>
</Sticker>

// Remember where people leave it.
<Sticker defaultOffset={saved} onStick={(offset) => save(offset)}>
  <Art />
</Sticker>

// Peel only: it lifts and falls back flat, and never leaves its spot.
<Sticker movable={false}>
  <Art />
</Sticker>`,
  api: [
    {
      name: "Sticker",
      extends: "div",
      props: [
        {
          name: "children",
          type: "React.ReactNode",
          required: true,
          description:
            "The artwork: an image, an inline SVG or any element. It sets the sticker's size, and its painted shape becomes the die cut.",
        },
        {
          name: "border",
          type: "number",
          default: "6",
          description: "Width of the die-cut border in px, traced around the artwork's shape. `0` for none.",
        },
        { name: "borderColor", type: "string", default: `"#ffffff"`, description: "Colour of the die-cut border." },
        {
          name: "backColor",
          type: "string",
          default: `"#eceae4"`,
          description: "Colour of the sticker's back, seen on the peeled flap.",
        },
        { name: "rotate", type: "number", default: "0", description: "Tilt in degrees. Peeling and dragging account for it." },
        {
          name: "threshold",
          type: "number",
          default: "0.4",
          description: "Share of the sticker, from 0 to 1, that has to be peeled before it comes off in your hand.",
        },
        {
          name: "movable",
          type: "boolean",
          default: "true",
          description:
            "Let the sticker come off and be stuck down somewhere else. When `false` it only peels and falls back flat, and isn't focusable.",
        },
        {
          name: "bounded",
          type: "boolean",
          default: "true",
          description:
            "Keep a moved sticker's centre inside its parent. Past the edge it drags with resistance, then springs back in.",
        },
        {
          name: "hoverPeel",
          type: "boolean",
          default: "true",
          description: "Curl the nearest corner up as the mouse comes close. Mouse only, and off with reduced motion.",
        },
        {
          name: "defaultOffset",
          type: "{ x: number; y: number }",
          description: "Where the sticker starts, relative to its place in the layout, in px. Read once on mount.",
        },
        { name: "onPeel", type: "() => void", description: "Called when the sticker comes off, by peeling or from the keyboard." },
        {
          name: "onStick",
          type: "(offset: { x: number; y: number }) => void",
          description: "Called when the sticker is stuck down, with its offset from its place in the layout. Feed it back as `defaultOffset`.",
        },
        { name: "label", type: "string", default: `"Sticker"`, description: "Accessible name of the sticker, which is a button." },
        {
          name: "haptics",
          type: "boolean",
          default: "true",
          description: "Buzz the device as the sticker comes off and goes down, where the Vibration API exists (most Android browsers).",
        },
      ],
    },
  ],
  notes: [
    "The peel starts at the artwork's real edge, not its bounding box. The component reads the shape from images, inline SVGs, backgrounds and text inside it. If a cross-origin image blocks that, it falls back to the image's box, so serve sticker art from your own origin or with CORS.",
    "The children render five times: the sticker, its back, the crease shading and two shadows. The copies are `inert` and hidden from screen readers, but anything with effects runs five times, so keep stickers to artwork.",
    "Peeling past the threshold lifts the sticker into your hand. Drag it anywhere and let go to stick it down. The sticker touched last sits on top.",
    "Enter or Space lifts a focused sticker, the arrow keys move it (Shift for bigger steps), Enter sticks it down and Escape puts it back.",
    "The sticker sets `touch-action: none`, so a finger on it peels instead of scrolling the page.",
    "The border, back and shadows are SVG filters, so they reach past the sticker's box. Leave a little room around it, or a parent with `overflow: hidden` clips them.",
    "Position the sticker with `className` (for example `absolute top-8 left-10 w-28`) and tilt it with `rotate`. A `transform` on the sticker itself is overwritten while it moves.",
  ],
}
