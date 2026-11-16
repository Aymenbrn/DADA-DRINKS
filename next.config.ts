import type { NextConfig } from "next";
import createMDX from "@next/mdx";

const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  compress: true,
  poweredByHeader: false,
  images: { formats: ["image/avif", "image/webp"] },
  // les visuels (étiquettes, photos) changent rarement : cache navigateur long
  async headers() {
    return [
      { source: "/:dir(labels|brand|pro|news|story)/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=604800, stale-while-revalidate=86400" }] },
    ];
  },
};

// Actualités rédigées en MDX (content/actualites/*.mdx)
const withMDX = createMDX({});

export default withMDX(nextConfig);
