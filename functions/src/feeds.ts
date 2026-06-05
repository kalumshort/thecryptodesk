// Crypto news RSS feeds to ingest. Add or remove sources freely.
//
// `defaultCategory` is a hint only — the AI assigns the final category from the
// fixed taxonomy below. It is used as a fallback if the model omits one.

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

export interface Feed {
  name: string;
  url: string;
  defaultCategory: Category;
}

export const FEEDS: Feed[] = [
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    defaultCategory: "market",
  },
  {
    name: "Cointelegraph",
    url: "https://cointelegraph.com/rss",
    defaultCategory: "market",
  },
  {
    name: "Decrypt",
    url: "https://decrypt.co/feed",
    defaultCategory: "market",
  },
  {
    name: "Bitcoin Magazine",
    url: "https://bitcoinmagazine.com/.rss/full/",
    defaultCategory: "bitcoin",
  },
];

// How many fresh items to process per feed, per run (caps AI cost).
export const MAX_ITEMS_PER_FEED = 5;
