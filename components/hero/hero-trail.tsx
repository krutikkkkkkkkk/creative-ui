import { getImageProps } from "next/image"

import { ImageTrail } from "@/registry/new-york/blocks/image-trail/image-trail"

/**
 * The hero's cursor trail: the registry's ImageTrail fed with the Old Masters × tech
 * paintings, resized by next/image for the 168px cards. Areas marked with
 * `data-trail-quiet` (plus half a card of margin) never spawn cards.
 */

const TRAIL_ART = [
  { src: "/art/bust-headphones.webp", alt: "Marble bust of a Roman woman wearing white headphones" },
  { src: "/art/hands-card.webp", alt: "Hands in red velvet presenting a blank marble card" },
  { src: "/art/muse-phone.webp", alt: "A woman in a white classical gown reading a smartphone" },
  { src: "/art/scholar-laptop.webp", alt: "A woman in a white gown typing on a halftone laptop" },
  { src: "/art/cherub-swatches.webp", alt: "A cherub holding a paintbrush and a fan of colour swatches" },
  { src: "/art/sorting-prints.webp", alt: "A woman sorting prints at a wooden desk" },
  { src: "/art/laureate-laptop.webp", alt: "A marble statue with a laurel wreath holding a black laptop" },
  { src: "/art/sculptor-chisel.webp", alt: "A sculptor's hands with chisel and mallet at a marble face" },
  { src: "/art/still-life-keyboard.webp", alt: "Still life with grapes, oranges, a pewter jug and a keyboard" },
  { src: "/art/owl-keyboard.webp", alt: "An owl perched on a cream mechanical keyboard" },
  { src: "/art/statue-tablet.webp", alt: "A marble youth drawing on a black tablet with a stylus" },
  { src: "/art/weaver-cable.webp", alt: "A woman at a spinning wheel spins thread into a white cable" },
  { src: "/art/printing-press.webp", alt: "A printmaker pulls a website wireframe from a wooden press" },
  { src: "/art/architect-compass.webp", alt: "An architect's hands with a brass compass over an inked interface grid" },
  { src: "/art/philosopher-mouse.webp", alt: "An old philosopher studies a white computer mouse in his palm" },
]

// getImageProps' `src` is the 2x candidate, so the cards stay crisp on retina screens.
const images = TRAIL_ART.map(({ src, alt }) => ({
  src: getImageProps({ src, alt, width: 168, height: 210 }).props.src,
  alt,
}))

export function HeroTrail() {
  return <ImageTrail images={images} className="z-20" />
}
