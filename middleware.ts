import { NextResponse, type NextRequest } from "next/server"

import { DEFAULT_UI_STYLE, UI_STYLE_COOKIE, UI_STYLE_PARAM, isUiStyle } from "@/lib/ui-style"

/* Every page exists twice, at /classic/... and /modern/... (app/[style]). This picks one from the
   visitor's cookie and rewrites to it, so both stay static and the URL never changes. */

const YEAR = 60 * 60 * 24 * 365

export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request

  // A shared link like /docs?style=modern: remember the choice, then drop the param.
  const requested = nextUrl.searchParams.get(UI_STYLE_PARAM)
  if (isUiStyle(requested)) {
    const clean = nextUrl.clone()
    clean.searchParams.delete(UI_STYLE_PARAM)
    const response = NextResponse.redirect(clean)
    response.cookies.set(UI_STYLE_COOKIE, requested, { path: "/", maxAge: YEAR, sameSite: "lax" })
    return response
  }

  const cookie = cookies.get(UI_STYLE_COOKIE)?.value
  const style = isUiStyle(cookie) ? cookie : DEFAULT_UI_STYLE
  const target = nextUrl.clone()
  target.pathname = `/${style}${nextUrl.pathname === "/" ? "" : nextUrl.pathname}`
  return NextResponse.rewrite(target)
}

export const config = {
  // Pages only: not API routes, Next internals, or anything with a file extension
  // (/r/*.json, /art/*.webp, /llms.txt, /docs/[name]/llms.txt, icons).
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
}
