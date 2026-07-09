import type { MetadataRoute } from "next";

import { env } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = env.NEXT_PUBLIC_SITE_URL;
  const lastModified = new Date();

  return [
    { url: base, lastModified, changeFrequency: "weekly", priority: 1 },
    { url: new URL("/privacy", base).toString(), lastModified, priority: 0.3 },
    { url: new URL("/offer", base).toString(), lastModified, priority: 0.3 },
  ];
}
