import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { GeistSerifRegular } from "geist/font/serif/regular"
import Script from "next/script"
import { Analytics } from "@vercel/analytics/next"

import { COMPANY_NAME, SITE_URL } from "@/lib/registry"
import { AUTHOR, OG_IMAGE, SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo"
import { X_HANDLE } from "@/lib/sponsors"
import { UI_STYLES, styleOf, type StyleParams } from "@/lib/ui-style"
import { ThemeProvider } from "@/components/theme-provider"
import { PageViewTracker } from "@/components/visitor-count"
import "../globals.css"

/* Google Tag Manager container. */
const GTM_ID = "GTM-NTLHSPCG"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [AUTHOR],
  creator: AUTHOR.name,
  publisher: COMPANY_NAME,
  category: "technology",
  keywords: [
    "shadcn",
    "shadcn registry",
    "shadcn/ui components",
    "React components",
    "Next.js components",
    "Tailwind CSS",
    "Claude skills",
    "Claude Code",
    "image effects",
    "halftone",
    "duotone",
    "carousel",
    "creative UI",
  ],
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  /* Pages that set their own openGraph replace this whole object; see pageMetadata in lib/seo. */
  openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", creator: `@${X_HANDLE}`, images: [OG_IMAGE] },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
}

/* Both looks are built ahead of time; middleware.ts rewrites each request to one of them. */
export const dynamicParams = false

export function generateStaticParams() {
  return UI_STYLES.map((style) => ({ style }))
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{ children: React.ReactNode; params: StyleParams }>) {
  const style = await styleOf(params)

  return (
    // Font variables sit on <html> so the :root display-face token can resolve them.
    <html
      lang="en"
      data-style={style}
      className={`${geistSans.variable} ${geistMono.variable} ${GeistSerifRegular.variable}`}
      suppressHydrationWarning
    >
      <head>
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
        </Script>
      </head>
      <body className="font-sans antialiased">
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
        <PageViewTracker />
        <Analytics />
      </body>
    </html>
  )
}
