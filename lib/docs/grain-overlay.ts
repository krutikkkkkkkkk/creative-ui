import type { ItemDocs } from "./types"

export const grainOverlay: ItemDocs = {
  usage: `import { GrainOverlay } from "@/components/grain-overlay"

export function Section() {
  return (
    <section className="relative bg-[#f4efe6] p-16">
      <h2>Made by hand</h2>
      <GrainOverlay variant="paper" />
    </section>
  )
}

// Or once, over the whole page:
<GrainOverlay fixed animate />`,
  api: [
    {
      name: "GrainOverlay",
      extends: "div",
      props: [
        {
          name: "variant",
          type: `"grain" | "paper" | "fiber"`,
          default: `"grain"`,
          description:
            "`grain` is fine film noise, `paper` is soft mottled stock with a warm tint, `fiber` is directional paper fibre. Sets the defaults for the props below.",
        },
        {
          name: "opacity",
          type: "number",
          default: "per variant",
          description: "Layer opacity, 0 to 1. Grain `0.22`, paper `0.45`, fiber `0.35`.",
        },
        {
          name: "frequency",
          type: "number | [number, number]",
          default: "per variant",
          description:
            "Noise frequency. Higher is finer. A pair sets x and y separately. Grain `0.85`, paper `0.045`, fiber `[0.012, 0.65]`.",
        },
        {
          name: "octaves",
          type: "number",
          default: "per variant",
          description: "Turbulence octaves. More add finer detail. Grain `2`, paper `5`, fiber `3`.",
        },
        { name: "seed", type: "number", default: "2", description: "Noise seed, so two overlays can differ or match." },
        {
          name: "size",
          type: "number",
          default: "per variant",
          description: "Tile size in px. Grain `256`, paper and fiber `512`.",
        },
        {
          name: "color",
          type: "string",
          description: "Tint the noise with a colour. When omitted, neutral luminance noise is used.",
        },
        {
          name: "blend",
          type: "CSSProperties[\"mixBlendMode\"]",
          default: "per variant",
          description: "CSS `mix-blend-mode`. Grain `overlay`, paper and fiber `multiply`.",
        },
        {
          name: "fixed",
          type: "boolean",
          default: "false",
          description: "Cover the viewport instead of the nearest positioned ancestor.",
        },
        {
          name: "animate",
          type: "boolean",
          default: "false",
          description: "Subtle film flicker. Turned off for users who prefer reduced motion.",
        },
      ],
    },
  ],
  exports: [
    {
      signature: "noiseTexture({ frequency, octaves, seed, size, asMask? })",
      description:
        "Builds the tiling SVG noise as a CSS `url()`, for use as a `background-image` or `mask-image` anywhere else.",
    },
  ],
  notes: [
    "Place it inside an element with `position: relative`. It fills that element and never blocks clicks.",
    "`fixed` uses `z-50`. Override it with `className` if it covers dialogs or toasts.",
    "No client JavaScript, so it is safe in React Server Components.",
  ],
}
