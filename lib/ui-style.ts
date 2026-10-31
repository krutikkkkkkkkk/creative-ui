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

export type StyleParams = Promise<{ style: string }>

/** The style segment of a page's params, narrowed. dynamicParams is off, so anything else 404s earlier. */
export async function styleOf(params: StyleParams): Promise<UiStyle> {
  const { style } = await params
  return isUiStyle(style) ? style : DEFAULT_UI_STYLE
}
