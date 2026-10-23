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
<GrainOverlay fixed animate opacity={0.12} />`,
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
            "`grain` is fine film grain. `paper` is warm stock with fine tooth and faint mottling. `fiber` is handmade paper with loose strands. Sets the defaults for the props below.",
        },
        {
          name: "opacity",
          type: "number",
          default: "per variant",
          description: "Layer opacity, 0 to 1. Grain `0.25`, paper `0.45`, fiber `0.5`.",
        },
        {
          name: "frequency",
          type: "number | [number, number]",
          default: "per variant",
          description:
            "Frequency of the variant's main noise. Higher is finer. A pair sets x and y separately. Grain `0.85`, paper tooth `0.9`, fiber strands `0.03`.",
        },
        {
          name: "octaves",
          type: "number",
          default: "per variant",
          description: "Octaves of the main noise. More add finer detail. Grain `4`, paper `3`, fiber `1`.",
        },
        {
          name: "contrast",
          type: "number",
          default: "per variant",
          description:
            "How hard the specks are cut from the noise. Higher is crisper and stronger. Grain `2.2`, paper `1.8`, fiber `28`.",
        },
        { name: "seed", type: "number", default: "2", description: "Noise seed, so two overlays can differ or match." },
        {
          name: "size",
          type: "number",
          default: "per variant",
          description: "Tile size in px. Grain `240`, paper and fiber `480`.",
        },
        {
          name: "color",
          type: "string",
          description:
            "Paint every speck in one colour. Any CSS colour works, including `var(--primary)` and `currentColor`. When omitted, the texture uses dark and light specks.",
        },
        {
          name: "blend",
          type: "CSSProperties[\"mixBlendMode\"]",
          default: `"normal"`,
          description:
            "CSS `mix-blend-mode`. The texture is already dark and light specks on transparency, so it needs no blend mode. Set one for a specific look, such as `soft-light` over photos.",
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
          description:
            "Film flicker: the grain jumps between eight held frames at about 10fps. It runs on the compositor and stays still for users who prefer reduced motion.",
        },
      ],
    },
  ],
  exports: [
    {
      signature: "noiseTexture({ variant?, frequency?, octaves?, contrast?, seed?, size? })",
      description:
        "Builds a variant's tiling SVG noise as a CSS `url()`. The alpha channel carries the texture, so it works as a `background-image` or a `mask-image`.",
    },
    {
      signature: "grainPresets",
      description: "The default size, opacity, colours and noise layers for each variant.",
    },
  ],
  notes: [
    "Place it inside an element with `position: relative`. It fills that element and never blocks clicks.",
    "It reads on light, dark and photographic surfaces without a blend mode, because each pixel is either transparent or a dark or light speck.",
    "`fixed` uses `z-50`. Override it with `className` if it covers dialogs or toasts.",
    "It is hidden when printing and in forced-colours mode.",
    "No client JavaScript, so it is safe in React Server Components. With `animate`, the keyframes are added to the page once, however many overlays use them.",
  ],
}
