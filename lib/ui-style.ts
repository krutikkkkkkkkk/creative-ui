/* The site ships in two looks. Both are prerendered under app/[style]; middleware.ts picks one
   per request from a cookie and rewrites to it, so URLs never show the style. */

export const UI_STYLES = ["classic", "modern"] as const
export type UiStyle = (typeof UI_STYLES)[number]

export const DEFAULT_UI_STYLE: UiStyle = "classic"
export const UI_STYLE_COOKIE = "ui-style"
/** `?style=modern` sets the cookie, so each look can be shared as a link. */
export const UI_STYLE_PARAM = "style"

export function isUiStyle(value: unknown): value is UiStyle {
  return UI_STYLES.includes(value as UiStyle)
}

/* The modern look is unfinished, so production serves classic only: the modern tree is not built,
   middleware.ts ignores a modern cookie or link, and the toggle shows it as work in progress.
   Local dev keeps both so the look can still be worked on. To launch modern, make this UI_STYLES. */
export const LIVE_UI_STYLES: readonly UiStyle[] = process.env.NODE_ENV === "production" ? ["classic"] : UI_STYLES

export function isLiveUiStyle(value: unknown): value is UiStyle {
  return LIVE_UI_STYLES.includes(value as UiStyle)
}

/* Each look is also a collection. A registry item tagged `meta.look` in registry.json is listed
   in that look only: classic holds the art-directed pieces, modern the clean technical ones. */
export const COLLECTIONS: Record<UiStyle, { label: string; tag: string; blurb: string }> = {
  classic: {
    label: "Classic",
    tag: "art and creative",
    blurb: "art-directed pieces for portfolios and creative sites, such as image effects, carousels and reveals",
  },
  modern: {
    label: "Modern",
    tag: "clean and technical",
    blurb: "clean, technical components for apps and tools",
  },
}

export function otherStyle(style: UiStyle): UiStyle {
  return style === "classic" ? "modern" : "classic"
}

export type StyleParams = Promise<{ style: string }>

/** The style segment of a page's params, narrowed. dynamicParams is off, so anything else 404s earlier. */
export async function styleOf(params: StyleParams): Promise<UiStyle> {
  const { style } = await params
  return isUiStyle(style) ? style : DEFAULT_UI_STYLE
}
