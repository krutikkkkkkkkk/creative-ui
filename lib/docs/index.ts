import { collageFrame } from "./collage-frame"
import { ditheringHover } from "./dithering-hover"
import { dnaCarousel } from "./dna-carousel"
import { duotoneImage } from "./duotone-image"
import { grainOverlay } from "./grain-overlay"
import { halftoneImage } from "./halftone-image"
import { imageTrail } from "./image-trail"
import { rotundaCarousel } from "./rotunda-carousel"
import type { ItemDocs } from "./types"

export type { ComponentApi, ExportDoc, ItemDocs, PropDoc } from "./types"

/**
 * Usage, props and notes shown on component pages.
 * When you add a component to registry.json, add `lib/docs/<name>.ts` and register it here by item name.
 */
export const docs: Record<string, ItemDocs> = {
  "halftone-image": halftoneImage,
  "grain-overlay": grainOverlay,
  "collage-frame": collageFrame,
  "duotone-image": duotoneImage,
  "dna-carousel": dnaCarousel,
  "dithering-hover": ditheringHover,
  "rotunda-carousel": rotundaCarousel,
  "image-trail": imageTrail,
}
