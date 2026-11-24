import type { ItemDocs } from "./types"

export const scratchCard: ItemDocs = {
  usage: `import { ScratchCard } from "@/components/scratch-card"

export function Coupon() {
  return (
    <ScratchCard className="h-20 w-64 rounded-md" onReveal={() => track("coupon_revealed")}>
      <div className="grid size-full place-items-center bg-muted font-serif italic">
        Breakfast in bed
      </div>
    </ScratchCard>
  )
}

// Gold foil with a label, a wider brush, and the rest falling away at 40%.
<ScratchCard foil="gold" foilLabel="Scratch here" brushSize={36} threshold={0.4} onProgress={setProgress}>
  <Prize />
</ScratchCard>

// Controlled. Remount with a new key to lay fresh foil over a half-scratched card.
const [revealed, setRevealed] = React.useState(false)

<ScratchCard key={round} revealed={revealed} onRevealedChange={setRevealed}>
  <Prize />
</ScratchCard>`,
  api: [
    {
      name: "ScratchCard",
      extends: "div",
      props: [
        {
          name: "children",
          type: "React.ReactNode",
          required: true,
          description:
            "What sits under the foil. The card takes its size from this, or from `className`. It is inert and hidden from screen readers until revealed.",
        },
        {
          name: "foil",
          type: `"silver" | "gold" | "copper" | string`,
          default: `"silver"`,
          description: "A named foil or any `#rrggbb` hex. The sheen, brushing and flakes are mixed from it.",
        },
        {
          name: "brushSize",
          type: "number",
          default: "28",
          description: "Width of the scratch in px. The cursor ring matches it, up to 60 px.",
        },
        {
          name: "threshold",
          type: "number",
          default: "0.6",
          description: "Share of foil, from 0 to 1, that has to be scratched before the rest fades away.",
        },
        {
          name: "revealed",
          type: "boolean",
          description: "Controlled revealed state. Pair with `onRevealedChange`. Setting it back to `false` lays fresh foil.",
        },
        { name: "defaultRevealed", type: "boolean", default: "false", description: "Initial state when uncontrolled." },
        {
          name: "onRevealedChange",
          type: "(revealed: boolean) => void",
          description: "Called with `true` when the card is revealed by scratching or the keyboard.",
        },
        { name: "onReveal", type: "() => void", description: "Called once when the card is revealed." },
        {
          name: "onProgress",
          type: "(progress: number) => void",
          description: "Called as the foil comes off, with the scratched share from 0 to 1, at most once per percent.",
        },
        { name: "foilLabel", type: "string", description: "Text pressed into the foil, set in capitals." },
        {
          name: "flakes",
          type: "boolean",
          default: "true",
          description: "Shed small flakes of foil that tumble and fall while scratching. Off with reduced motion.",
        },
        {
          name: "label",
          type: "string",
          default: `"Scratch to reveal"`,
          description: "Accessible name of the foil, which is a button.",
        },
        {
          name: "hint",
          type: "string",
          default: `"Drag across the foil to scratch it off, or press Enter to reveal"`,
          description: "Instructions read by screen readers through `aria-describedby`.",
        },
        {
          name: "revealedLabel",
          type: "string",
          default: `"Revealed"`,
          description: "Announced through a polite live region once revealed.",
        },
        {
          name: "seed",
          type: "number",
          default: "3",
          description: "Seed for the foil's grain and the ragged edge of the scratch. Give each card on a page its own.",
        },
        {
          name: "haptics",
          type: "boolean",
          default: "true",
          description: "Buzz the device on reveal where the Vibration API exists (most Android browsers).",
        },
      ],
    },
  ],
  exports: [
    {
      signature: "scratchCardFoils",
      description: "The three named foils as hex, for building your own picker.",
    },
  ],
  notes: [
    "Enter or Space on the focused foil reveals the card at once, and focus moves to what was underneath.",
    "The foil sets `touch-action: none`, so a finger on it scratches instead of scrolling the page. Keep cards small enough on mobile that there's room around them to scroll.",
    "Flakes fly up to 32 px past the sides and 96 px below the card. A parent with `overflow: hidden` clips them.",
    "Scratches are stored relative to the card's size, so a resize redraws the foil and replays them.",
    "Until the canvas paints, the foil is a solid block of its middle colour, so the prize never flashes on load. The prize is still in the HTML, so don't hide anything secret under it: decide the prize on the server only once it's revealed.",
    "The colour must be hex, because the foil is mixed from it in JavaScript. CSS variables and named colours fall back to silver.",
  ],
}
