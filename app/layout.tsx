import type { Metadata } from "next";
import { Urbanist , Instrument_Serif } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
});



export const metadata: Metadata = {
  title: "UI Critic",
  description: "Elevate your UI with better components.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`font-urbanist antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
