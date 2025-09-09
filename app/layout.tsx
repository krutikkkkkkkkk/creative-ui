import type { Metadata } from "next";
import { Urbanist , Instrument_Serif } from "next/font/google";
import "./globals.css";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  style: ["normal", "italic"],
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
        className={` ${urbanist.variable}  ${instrumentSerif.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
