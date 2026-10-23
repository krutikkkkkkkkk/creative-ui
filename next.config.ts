import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Item pages moved from /items/* to /docs/*; keep old links working.
  async redirects() {
    return [{ source: "/items/:name", destination: "/docs/:name", permanent: true }];
  },
  // Let other tools (v0, registry viewers) fetch registry JSON cross-origin.
  async headers() {
    return [
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
