import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CategoryListing,
  categoryMetadata,
} from "@/components/category-listing";
import {
  POSTS_PER_PAGE,
  countPostsByCategory,
  pageCount,
} from "@/lib/posts";
import { CATEGORIES, isCategory } from "@/types/post";

export const revalidate = 300;
export const dynamicParams = true;

type Params = { params: Promise<{ category: string; page: string }> };

/**
 * Pages 2..N only — page 1 lives at the bare `/category/[category]` path, and
 * `/page/1` is redirected there by `next.config.ts` so the two never compete
 * as duplicates.
 */
export async function generateStaticParams() {
  const out: { category: string; page: string }[] = [];
  for (const category of CATEGORIES) {
    const total = pageCount(await countPostsByCategory(category));
    for (let p = 2; p <= total; p++) {
      out.push({ category, page: String(p) });
    }
  }
  return out;
}

/** Reject anything that isn't a plain integer ≥ 2 (`01`, `2.5`, `abc`, `-1`). */
function parsePage(raw: string): number | null {
  if (!/^[1-9][0-9]*$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 2 ? n : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category, page } = await params;
  const n = parsePage(page);
  if (!isCategory(category) || n === null) return { title: "Not found" };
  return categoryMetadata(category, n);
}

export default async function CategoryPagedPage({ params }: Params) {
  const { category, page } = await params;
  const n = parsePage(page);
  if (!isCategory(category) || n === null) notFound();

  // Refuse pages beyond the cap so crawlers can't walk an infinite tail.
  const total = pageCount(await countPostsByCategory(category), POSTS_PER_PAGE);
  if (n > total) notFound();

  return <CategoryListing category={category} page={n} />;
}
