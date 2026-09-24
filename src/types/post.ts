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

/**
 * Hand-written intro copy for each category hub.
 *
 * Category pages previously had nothing but a one-word heading and a grid of
 * cards — no indexable prose at all, which is why they had nothing to rank on.
 * These also feed each hub's meta description.
 */
export const CATEGORY_INTROS: Record<Category, string> = {
  bitcoin:
    "Bitcoin news: price moves and what drove them, spot ETF flows, mining and hashrate, institutional and treasury buying, and the protocol changes that matter. Every report links back to the original source.",
  ethereum:
    "Ethereum news: protocol upgrades and their timelines, staking and validator economics, layer-2 rollups and fees, ETH price action, and the applications being built on top.",
  altcoins:
    "Coverage of everything outside Bitcoin and Ethereum — Solana, XRP, Cardano and the rest. Launches, upgrades, listings, token unlocks and the price moves that follow.",
  defi: "Decentralised finance: lending and borrowing protocols, decentralised exchanges, stablecoins, yield and liquidity, total value locked, and the exploits and failures worth learning from.",
  nft: "NFTs and digital collectibles: marketplace volumes, notable collections and mints, gaming and metaverse assets, royalties, and the shifting economics of the space.",
  regulation:
    "Crypto regulation and policy: SEC and CFTC enforcement, legislation and rulemaking, court decisions, tax treatment, and how rules differ across the US, EU, UK and Asia.",
  market:
    "Crypto market analysis: total market capitalisation, Bitcoin dominance, volatility and liquidations, ETF and institutional flows, and the macro backdrop moving digital assets.",
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
