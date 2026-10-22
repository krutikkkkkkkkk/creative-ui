import * as React from "react"

import { HelloWorld } from "@/registry/new-york/blocks/hello-world/hello-world"

/**
 * Live previews shown on component pages.
 * When you add a component to registry.json, register its preview here by item name.
 */
export const previews: Record<string, React.ComponentType> = {
  "hello-world": HelloWorld,
}
