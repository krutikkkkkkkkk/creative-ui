import type { ItemDocs } from "./types"

export const waxSeal: ItemDocs = {
  usage: `import { WaxSeal } from "@/components/wax-seal"

export function SignOff() {
  return (
    <WaxSeal onSeal={() => submitContract()}>
      <span className="font-serif text-[1.4em]">A</span>
    </WaxSeal>
  )
}

// Controlled, in teal, with a reset elsewhere on the page.
const [sealed, setSealed] = React.useState(false)

<WaxSeal color="teal" sealed={sealed} onSealedChange={setSealed} holdDuration={1600} size={104}>
  <MonogramIcon className="size-[1.1em]" />
</WaxSeal>
<button onClick={() => setSealed(false)}>Start over</button>

// The open variant starts stamped. Holding cracks the wax and it snaps in two.
<WaxSeal variant="open" onOpen={() => setLetterOpen(true)}>
  <span className="font-serif text-[1.4em]">A</span>
</WaxSeal>`,
  api: [
    {
      name: "WaxSeal",
      extends: "button",
      props: [
        {
          name: "variant",
          type: `"seal" | "open"`,
          default: `"seal"`,
          description:
            "`seal` starts bare: holding pools wax and stamps it. `open` starts stamped: holding strains the wax until it cracks across and snaps into two halves, with a few crumbs shaken loose.",
        },
        {
          name: "onSeal",
          type: "() => void",
          description: "Called once when a hold completes and the seal is stamped. `seal` only.",
        },
        {
          name: "onOpen",
          type: "() => void",
          description: "Called once when a hold completes and the seal breaks. `open` only.",
        },
        {
          name: "holdDuration",
          type: "number",
          default: "1100",
          description:
            "How long the press must be held, in ms. Letting go early draws the wax back, or lets the crack close, faster than it grew.",
        },
        {
          name: "color",
          type: `"oxblood" | "black" | "gold" | "teal" | string`,
          default: `"oxblood"`,
          description:
            "A named wax colour or any `#rrggbb` hex. Highlights, shadows and the impression are mixed from it.",
        },
        {
          name: "sealed",
          type: "boolean",
          description:
            "Controlled sealed state. Pair with `onSealedChange`. In `open`, setting it back to `true` mends the seal.",
        },
        {
          name: "defaultSealed",
          type: "boolean",
          default: "false",
          description: "Initial sealed state when uncontrolled. Defaults to `true` for `open`.",
        },
        {
          name: "onSealedChange",
          type: "(sealed: boolean) => void",
          description: "Called with `true` when a seal is stamped and with `false` when it is broken.",
        },
        {
          name: "resetOnClick",
          type: "boolean",
          default: "false",
          description:
            "Let a fresh click on a sealed button break the seal. The press that sealed it never breaks it. Without this, unseal by setting `sealed` to `false`. `seal` only.",
        },
        {
          name: "children",
          type: "React.ReactNode",
          description:
            "The impression the stamp leaves: a letter, monogram or icon. Text is sized at about a third of `size`, so size icons in `em`.",
        },
        {
          name: "label",
          type: "React.ReactNode",
          default: `"Hold to seal"`,
          description: "Visible label before the hold completes. Defaults to `\"Hold to open\"` for `open`.",
        },
        {
          name: "sealedLabel",
          type: "string",
          default: `"Sealed"`,
          description: "Visible label once sealed. Also announced through a polite live region. `seal` only.",
        },
        {
          name: "openedLabel",
          type: "string",
          default: `"Opened"`,
          description: "Visible label once the seal is broken. Also announced through a polite live region. `open` only.",
        },
        {
          name: "hint",
          type: "string",
          default: `"Press and hold to confirm"`,
          description:
            "Instructions read by screen readers through `aria-describedby`. Defaults to `\"Press and hold to break the seal\"` for `open`.",
        },
        { name: "size", type: "number", default: "88", description: "Diameter of the seal area in px." },
        {
          name: "seed",
          type: "number",
          default: "7",
          description: "Seed for the shape of the wax and, in `open`, the path of the crack. Give each seal on a page its own.",
        },
        {
          name: "haptics",
          type: "boolean",
          default: "true",
          description: "Buzz the device on seal or break where the Vibration API exists (most Android browsers).",
        },
      ],
    },
  ],
  exports: [
    {
      signature: "waxSealColors",
      description: "The four named wax colours as hex, for building your own picker.",
    },
  ],
  notes: [
    "Space and Enter work the same as a pointer: hold the key to seal. Key repeat doesn't restart the hold.",
    "A touch that turns into a scroll cancels the hold, and so does sliding off the button or losing focus.",
    "Screen readers in browse mode send a single click, which can't hold. Users switch to focus mode, or use the pass-through gesture (double tap and hold on VoiceOver and TalkBack).",
    "With reduced motion the wax appears at full size and fills in by opacity while held. There is no squash or spread. In `open` the crack fades in, the seal doesn't tremble and the halves part without a snap.",
    "In `open` the seal is drawn as two halves once broken, so `children` render three times. Keep the impression presentational.",
    "The colour must be hex, because the shading is mixed from it in JavaScript. CSS variables and named colours are not supported.",
    "The label and the dashed outline use `currentColor`, so set the text colour to suit the surface the seal sits on.",
  ],
}
