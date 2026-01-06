import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = "https://kitchennotes.org";
  const now = new Date();

  // We can only list URLs we *know* at build time.
  // Dynamic /meal/[id] pages would need a real DB/list of ids to include here.
  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
  ];
}
