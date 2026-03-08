import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      // Add your R2 public hostname if using next/image with R2 (e.g. "pub-xxx.r2.dev")
    ],
  },
};

export default nextConfig;
