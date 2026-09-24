import type { MetadataRoute } from "next";
import {
  countPostsByCategory,
  getAllPublishedSlugs,
  getArchiveIndex,
  getPublishedTagCounts,
  pageCount,
} from "@/lib/posts";
import { getAllGuideSlugs } from "@/lib/guides";
import { CATEGORIES } from "@/types/post";
import { GLOSSARY } from "@/lib/glossary";
import { getAllAuthorSlugs } from "@/lib/authors";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [slugs, archive, guideSlugs, tagCounts] = await Promise.all([
    getAllPublishedSlugs(),
    getArchiveIndex(),
    getAllGuideSlugs(),
    getPublishedTagCounts(),
  ]);

  // Hand-written standing pages change only when we edit them, so they carry a
  // build-time `lastModified` rather than none at all.
  const now = new Date();

  // Paginated category URLs, derived from the same count the routes use so the
  // sitemap can never advertise a page that 404s.
  const categoryPages: MetadataRoute.Sitemap = (
    await Promise.all(
      CATEGORIES.map(async (category) => {
        const pages = pageCount(await countPostsByCategory(category));
        return Array.from({ length: Math.max(0, pages - 1) }, (_, i) => ({
          url: absoluteUrl(`/category/${category}/page/${i + 2}`),
          lastModified: now,
          changeFrequency: "daily" as const,
          priority: 0.4,
        }));
      }),
    )
  ).flat();

  // Tags at or above the indexing threshold used by the tag route itself.
  // Must stay in step with THIN_TAG_THRESHOLD in `components/tag-listing.tsx`,
  // or the sitemap would advertise URLs that are noindexed.
  const TAG_THRESHOLD = 3;
  const tagRoutes: MetadataRoute.Sitemap = [...tagCounts.entries()]
    .filter(([, count]) => count >= TAG_THRESHOLD)
    .map(([tag]) => ({
      url: absoluteUrl(`/tag/${encodeURIComponent(tag)}`),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.4,
    }));

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: absoluteUrl("/market"), lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: absoluteUrl("/learn"), lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: absoluteUrl("/glossary"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/archive"), lastModified: now, changeFrequency: "daily", priority: 0.5 },
    // Trust / E-E-A-T pages.
    ...["/about", "/editorial-policy", "/contact", "/privacy", "/terms"].map(
      (path) => ({
        url: absoluteUrl(path),
        lastModified: now,
        changeFrequency: "yearly" as const,
        priority: 0.3,
      }),
    ),
    ...CATEGORIES.map((c) => ({
      url: absoluteUrl(`/category/${c}`),
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.7,
    })),
    // Paginated category pages. These are indexable, self-canonical URLs and
    // are the primary way crawlers reach posts past the first page.
    ...categoryPages,
    // Tag pages with enough articles to be worth indexing. Thinner tags are
    // noindex at the page level, so listing them here would be contradictory.
    ...tagRoutes,
    ...getAllAuthorSlugs().map((slug) => ({
      url: absoluteUrl(`/author/${slug}`),
      changeFrequency: "daily" as const,
      priority: 0.5,
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
