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
// les sauts de ligne entre paragraphes sont retirés : HTML identique à l'ancien rendu
type HastNode = { type: string; value?: string; children?: HastNode[] };
const rehypeTrimWhitespace = () => (tree: HastNode) => {
  tree.children = (tree.children ?? []).filter((c) => !(c.type === "text" && /^\s*$/.test(c.value ?? "")));
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const withMDX = createMDX({ options: { rehypePlugins: [rehypeTrimWhitespace] } as any });

export default withMDX(nextConfig);
