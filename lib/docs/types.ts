/**
 * Hand-written reference docs shown on component pages, below the preview.
 * Text fields accept `backticks` for inline code.
 */

export type PropDoc = {
  name: string
  /** TypeScript type as the user would write it, e.g. `"dot" | "line"`. */
  type: string
  /** Default value as code. Omit for required props or props with no default. */
  default?: string
  required?: boolean
  description: string
}

export type ComponentApi = {
  /** Exported component name, e.g. "CollageFrame". */
  name: string
  description?: string
  props: PropDoc[]
  /** Element whose native props are also accepted and spread, e.g. "div". */
  extends?: string
}

export type ExportDoc = {
  /** Signature as code, e.g. `drawHalftone(canvas, image, width, height, options?)`. */
  signature: string
  description: string
}

export type ItemDocs = {
  /** Minimal example using the installed import path. */
  usage: string
  api: ComponentApi[]
  /** Helpers and constants exported next to the component. */
  exports?: ExportDoc[]
  /** Caveats worth knowing before shipping: browser support, CORS, sizing, accessibility. */
  notes?: string[]
}
