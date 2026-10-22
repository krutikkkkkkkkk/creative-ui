import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
