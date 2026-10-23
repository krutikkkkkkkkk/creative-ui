import type { Metadata } from "next"
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google"

import { SITE_URL } from "@/lib/registry"
import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })
const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "creative-ui", template: "%s · creative-ui" },
  description: "Components and Claude skills by Krutik Raut, installable with the shadcn CLI.",
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} font-sans antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
