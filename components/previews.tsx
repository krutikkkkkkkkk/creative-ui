import * as React from "react"

import { CollageFrameDemo } from "@/components/demos/collage-frame-demo"
import { CyanotypeDemo } from "@/components/demos/cyanotype-demo"
import { DitheringHoverDemo } from "@/components/demos/dithering-hover-demo"
import { DnaCarouselDemo } from "@/components/demos/dna-carousel-demo"
import { DuotoneImageDemo } from "@/components/demos/duotone-image-demo"
import { EtchingDemo } from "@/components/demos/etching-demo"
import { GoldLeafDemo } from "@/components/demos/gold-leaf-demo"
import { GrainOverlayDemo } from "@/components/demos/grain-overlay-demo"
import { HalftoneImageDemo } from "@/components/demos/halftone-image-demo"
import { ImageTrailDemo } from "@/components/demos/image-trail-demo"
import { MarbledPaperDemo } from "@/components/demos/marbled-paper-demo"
import { RotundaCarouselDemo } from "@/components/demos/rotunda-carousel-demo"
import { TearRevealDemo } from "@/components/demos/tear-reveal-demo"
import { WaxSealDemo } from "@/components/demos/wax-seal-demo"

/**
 * Live previews shown on component pages.
 * When you add a component to registry.json, register its preview here by item name,
 * e.g. `"my-component": MyComponent`.
 */
export const previews: Record<string, React.ComponentType> = {
  "halftone-image": HalftoneImageDemo,
  "grain-overlay": GrainOverlayDemo,
  "collage-frame": CollageFrameDemo,
  "duotone-image": DuotoneImageDemo,
  "dna-carousel": DnaCarouselDemo,
  "dithering-hover": DitheringHoverDemo,
  "rotunda-carousel": RotundaCarouselDemo,
  "image-trail": ImageTrailDemo,
  cyanotype: CyanotypeDemo,
  "marbled-paper": MarbledPaperDemo,
  etching: EtchingDemo,
  "gold-leaf": GoldLeafDemo,
  "wax-seal": WaxSealDemo,
  "tear-reveal": TearRevealDemo,
}
