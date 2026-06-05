// Fixed set of categories. Kept in one place so the frontend nav, category
// pages, and the AI rewrite prompt all agree on the same taxonomy.
export const CATEGORIES = [
  "bitcoin",
  "ethereum",
  "altcoins",
  "defi",
  "nft",
  "regulation",
  "market",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  bitcoin: "Bitcoin",
  ethereum: "Ethereum",
  altcoins: "Altcoins",
  defi: "DeFi",
  nft: "NFTs",
  regulation: "Regulation",
  market: "Markets",
};

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

/** A single month in the date archive (one `archives/{YYYY-MM}` doc). */
export interface ArchiveEntry {
  year: number;
  month: number; // 1-12
  count: number;
}

/**
 * A news post as consumed by the frontend. Firestore Timestamps are converted
 * to ISO strings at the data-access boundary so these objects are plain and
 * safe to pass from Server Components into Client Components.
 */
export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown
  category: Category;
  tags: string[];
  coverImage: string;
  sourceUrl: string;
  sourceName: string;
  status: "published" | "draft";
  publishedAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  readingTimeMinutes: number;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  aiModel: string;
}
