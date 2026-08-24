import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_CONVEX_URL:
      process.env.NEXT_PUBLIC_CONVEX_URL ||
      "https://wandering-bass-539.convex.cloud",
  },
};

export default nextConfig;
