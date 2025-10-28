import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true, // ✅ prevents optimizer from breaking local /public images
  },
};

export default nextConfig;
