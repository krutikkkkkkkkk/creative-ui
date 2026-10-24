import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Barrel packages: without this, `import { Slot } from "radix-ui"` in the button bundles every
  // Radix primitive (Dialog, Tooltip...) into each page that renders a button.
  experimental: {
    optimizePackageImports: ["radix-ui", "@hugeicons/core-free-icons"],
  },
  // Item pages moved from /items/* to /docs/*; keep old links working.
  async redirects() {
    return [{ source: "/items/:name", destination: "/docs/:name", permanent: true }];
  },
  // Let other tools (v0, registry viewers) fetch registry JSON cross-origin.
  async headers() {
    return [
      // Hardening that costs nothing here: no page is framed, checkout is a redirect, not a popup.
      // A script CSP would need per-request nonces, which would make every static page dynamic.
      {
        source: "/:path*",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/r/:path*",
        headers: [
          { key: "Access-Control-Allow-Origin", value: "*" },
          { key: "Access-Control-Allow-Methods", value: "GET, OPTIONS" },
        ],
      },
    ];
  },
};

export default nextConfig;
