import type { MetadataRoute } from "next";
import { FLAVORS } from "@/lib/flavors";
import { ARTICLES } from "@/lib/news";
import { PRO_PRODUCTS } from "@/lib/pro";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = ["", "/boutique", "/professionnels", "/notre-histoire", "/collaborations", "/actualites", "/contact", "/mentions-legales", "/cgv", "/confidentialite"];
  return [
    ...pages.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...FLAVORS.map((f) => ({ url: `${SITE_URL}/saveurs/${f.slug}`, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...PRO_PRODUCTS.map((p) => ({ url: `${SITE_URL}/professionnels/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...ARTICLES.map((a) => ({ url: `${SITE_URL}/actualites/${a.slug}`, changeFrequency: "yearly" as const, priority: 0.5 })),
  ];
}
