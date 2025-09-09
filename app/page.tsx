import * as React from "react"
import { UICritic } from "@/registry/uicritic/components/uicritic/uicritic"


// This page displays items from the custom registry.
// You are free to implement this with your own design as needed.

export default function Home() {
  return (
    <div className="w-full relative mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
        <div
    className="absolute inset-0 z-0"
    style={{
      background: "radial-gradient(125% 125% at 50% 10%, #fff 40%, #6366f1 100%)",
    }}
  />
        <main className="min-h-screen flex flex-col items-center justify-center z-1">
                <UICritic />
                <p className="text-lg mt-3">Coming Soon...</p>
        </main>
    </div>
  )
}

