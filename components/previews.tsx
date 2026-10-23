import * as React from "react"

import { CollageFrameDemo } from "@/components/demos/collage-frame-demo"
import { DuotoneImageDemo } from "@/components/demos/duotone-image-demo"
import { GrainOverlayDemo } from "@/components/demos/grain-overlay-demo"
import { HalftoneImageDemo } from "@/components/demos/halftone-image-demo"

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
}
