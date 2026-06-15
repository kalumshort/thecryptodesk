import type { MetadataRoute } from "next";
import { getAllPublishedSlugs, getArchiveIndex } from "@/lib/posts";
import { getAllGuideSlugs } from "@/lib/guides";
import { CATEGORIES } from "@/types/post";
import { GLOSSARY } from "@/lib/glossary";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, archive, guideSlugs] = await Promise.all([
    getAllPublishedSlugs(),
    getArchiveIndex(),
    getAllGuideSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), changeFrequency: "hourly", priority: 1 },
    { url: absoluteUrl("/market"), changeFrequency: "hourly", priority: 0.8 },
    { url: absoluteUrl("/learn"), changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/glossary"), changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/archive"), changeFrequency: "daily", priority: 0.5 },
    ...CATEGORIES.map((c) => ({
      url: absoluteUrl(`/category/${c}`),
      changeFrequency: "hourly" as const,
      priority: 0.7,
    })),
    ...GLOSSARY.map((t) => ({
      url: absoluteUrl(`/glossary/${t.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    ...archive.map((e) => ({
      url: absoluteUrl(
        `/archive/${e.year}/${String(e.month).padStart(2, "0")}`,
      ),
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
  ];

  const postRoutes: MetadataRoute.Sitemap = slugs.map(({ slug, updatedAt }) => ({
    url: absoluteUrl(`/news/${slug}`),
    lastModified: new Date(updatedAt),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const guideRoutes: MetadataRoute.Sitemap = guideSlugs.map(
    ({ slug, updatedAt }) => ({
      url: absoluteUrl(`/learn/${slug}`),
      lastModified: new Date(updatedAt),
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  return [...staticRoutes, ...postRoutes, ...guideRoutes];
}
