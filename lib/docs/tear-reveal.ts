import type { ItemDocs } from "./types"

export const tearReveal: ItemDocs = {
  usage: `import { TearReveal } from "@/components/tear-reveal"

export function Ticket() {
  return (
    <TearReveal
      cover={<p className="grid size-full place-items-center font-serif text-2xl">Admit one</p>}
      className="aspect-[3/4] w-72 rounded-md"
    >
      <img src="/painting.jpg" alt="The painting behind the ticket" className="size-full rounded-md object-cover" />
    </TearReveal>
  )
}

// Controlled, with a reset.
const [torn, setTorn] = React.useState(false)

<TearReveal torn={torn} onTear={() => setTorn(true)} direction="corner" paper="#387478">
  <Prize />
</TearReveal>
<button onClick={() => setTorn(false)}>Reset</button>`,
  api: [
    {
      name: "TearReveal",
      extends: "div",
      props: [
        {
          name: "cover",
          type: "React.ReactNode",
          description:
            "What is printed on the paper: a label, an image, any node. It fills the sheet and inherits an ink colour that reads on `paper`, so `currentColor` works for text and rules. Omit for blank paper.",
        },
        {
          name: "children",
          type: "React.ReactNode",
          description: "The content under the paper. It is `inert` until the paper is torn.",
        },
        {
          name: "direction",
          type: `"down" | "across" | "corner"`,
          default: `"down"`,
          description:
            "Where the tear starts. `down` runs from a notch in the top edge, `across` from the left edge, `corner` from the top-right corner.",
        },
        {
          name: "paper",
          type: "string",
          default: `"#f4f1ea"`,
          description: "Paper colour, as hex. The torn rim is a lighter mix of it, the way coloured paper is white inside.",
        },
        {
          name: "threshold",
          type: "number",
          default: "0.4",
          description:
            "How far the tear must run before letting go tears it free, 0 to 1 of the way across. A quick flick in the tear direction also counts.",
        },
        { name: "torn", type: "boolean", description: "Controlled torn state. Set it back to `false` to put the paper back." },
        { name: "defaultTorn", type: "boolean", default: "false", description: "Initial torn state when uncontrolled." },
        {
          name: "onTear",
          type: "() => void",
          description: "Called when the paper tears free by drag or keyboard. Not called when `torn` is set from outside.",
        },
        {
          name: "seed",
          type: "number",
          default: "5",
          description: "Seed for the jagged edge and the way the halves fall. Change it on reset for a fresh tear.",
        },
        { name: "label", type: "string", default: `"Tear to reveal"`, description: "Accessible name for the cover." },
      ],
    },
  ],
  notes: [
    "Size the component with className, or let `children` size it. The cover always matches the content box.",
    "Only the notch handle captures touch, with `touch-action: none`, so the rest of the card still scrolls the page.",
    "The cover is a button. Enter or Space tears it in one automatic pass and moves focus to the content.",
    "With reduced motion the drag still works, but the paper fades out instead of falling.",
    "The halves fall outside the component's box. Add `overflow-hidden` to the root if they must stay inside.",
    "`cover` is rendered twice, once per half, so keep it presentational. Images in it load once and are reused from cache.",
    "When controlled, set `torn` to true in `onTear`. If it stays false, a fresh sheet comes back after the fall.",
  ],
}
