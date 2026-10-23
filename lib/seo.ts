import type { Metadata } from "next"

import { COMPANY_NAME, COMPANY_URL, GITHUB_URL, SITE_URL } from "@/lib/registry"
import { X_HANDLE } from "@/lib/sponsors"

export const SITE_NAME = "creative-ui"
export const SITE_TAGLINE = "React components and Claude skills for shadcn"
export const SITE_DESCRIPTION =
  "React components and Claude skills by Krutik Raut at Infinity Linkage, made with a designer’s eye and installable with the shadcn CLI."
export const AUTHOR = { name: "Krutik Raut", url: `https://x.com/${X_HANDLE}` }

/**
 * Site-wide social card, 1200x630. Composed in the Figma file "creative-ui · generated art"
 * (frame `26:2`), exported at 2x and downsampled. Item pages with a banner use that instead.
 */
export const OG_IMAGE = {
  url: "/og.jpg",
  width: 1200,
  height: 630,
  alt: "creative-ui: Timeless craft. One command away.",
}

type SocialImage = { url: string; width: number; height: number; alt?: string }

/**
 * Canonical URL and social cards for a page. Next replaces the layout's whole `openGraph`
 * object when a page sets one, so every page goes through here to keep the site name and
 * image. The og/twitter title and description are left out on purpose: Next fills them
 * from the page's own (templated) title and description.
 */
export function pageMetadata({
  title,
  description,
  path,
  image = OG_IMAGE,
}: {
  title?: Metadata["title"]
  description?: string
  path: string
  image?: SocialImage
}): Metadata {
  return {
    ...(title && { title }),
    ...(description && { description }),
    alternates: { canonical: path },
    openGraph: { type: "website", siteName: SITE_NAME, locale: "en_US", url: path, images: [image] },
    twitter: { card: "summary_large_image", creator: `@${X_HANDLE}`, images: [image] },
  }
}

/** Docs pages outside the registry items, for the sitemap and llms.txt. */
export const DOCS_PAGES = [
  { path: "/docs", title: "Introduction", description: "What creative-ui is and how items are installed." },
  {
    path: "/docs/installation/next",
    title: "Install Next.js",
    description: "Create a Next.js app with the App Router, TypeScript and Tailwind CSS.",
  },
  {
    path: "/docs/installation/tailwind",
    title: "Install Tailwind CSS",
    description: "Add Tailwind CSS v4 to a Next.js project with the PostCSS plugin.",
  },
  {
    path: "/docs/installation/utilities",
    title: "Add utilities",
    description: "Add the cn() class helper that every component imports.",
  },
  { path: "/docs/installation/cli", title: "CLI", description: "Install items with the shadcn CLI." },
  {
    path: "/docs/installation/mcp",
    title: "MCP Server",
    description: "Browse, search and install items from your AI assistant with the shadcn MCP server.",
  },
]

/** Site pages outside the docs, for the sitemap. */
export const SITE_PAGES = ["/sponsor", "/sponsor/apply", "/sponsor/platform", "/license", "/privacy", "/terms", "/refund-policy"]

/** schema.org graph for the home page: the site, its publisher and its author. */
export function siteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        inLanguage: "en",
        publisher: { "@id": `${SITE_URL}/#organization` },
        author: { "@id": `${SITE_URL}/#author` },
      },
      {
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: COMPANY_NAME,
        url: COMPANY_URL,
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#author`,
        name: AUTHOR.name,
        url: AUTHOR.url,
        sameAs: [AUTHOR.url, GITHUB_URL.replace(/\/[^/]+$/, "")],
        worksFor: { "@id": `${SITE_URL}/#organization` },
      },
    ],
  }
}
