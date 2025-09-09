import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

import * as React from "react"

export default function Home() {
  return (
    <div className="w-full relative mx-auto flex flex-col min-h-screen px-4 gap-8 bg-black">
        <div
    className="absolute inset-0 z-0"
    style={{
      background: "radial-gradient(125% 125% at 50% 10%, #000 40%, #6366f1 100%)",
    }}
  />
        <main className="min-h-screen flex flex-col items-center justify-center z-1">
          <h4 className="text-xl sm:text-3xl text-gray-500 mb-4 text-center py-2">
          Introducing <span className={`font-instrument-serif text-white`} >UI Critic</span>
          </h4>

          <h1 className="text-3xl sm:text-6xl font-normal text-white mb-4 text-center">
          The Ultimate Toolkit for Modern Interfaces
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl text-center mb-8">
          A curated collection of beautiful, accessible, and customizable components to elevate your web projects.
          </p>

        <h2
        className="text-2xl sm:text-4xl font-semibold text-white text-center animate-in fade-in-50 duration-1000"
        >
        Coming Soon...
        </h2>


        </main>
    </div>
  )
}

