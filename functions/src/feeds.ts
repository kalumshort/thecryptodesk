// Crypto news RSS feeds to ingest.
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
  /**
   * The feed publishes headlines and a one-line blurb, not article text.
   *
   * Items from these feeds are NEVER written from — there is nothing to write
   * from. They exist to say what is newsworthy: a story the big outlets are
   * also covering is a story worth covering, and they are cited as
   * corroborating sources once a piece is written from full-text reporting.
   */
  signalOnly?: boolean;
}

/**
 * Measured, not assumed. Median words of usable text per item, sampled from
 * the live feeds:
 *
 *   CoinJournal       816     CryptoSlate   522     BeInCrypto   459
 *   CryptoPotato      429     Bitcoin Mag   403
 *   CoinDesk           25     Cointelegraph  23   <- signal only
 *
 * CoinDesk publishes `<content:encoded/>` as an empty self-closing tag and
 * Cointelegraph omits it entirely, so both yield roughly 150 characters. The
 * old pipeline asked the model to produce 400-550 words from that, which meant
 * most of every article had no source behind it. Their article pages are
 * client-rendered, so fetching them does not help either — but five other
 * outlets simply publish the whole article in the feed.
 */
export const FEEDS: Feed[] = [
  {
    name: "CoinJournal",
    url: "https://coinjournal.net/feed/",
    defaultCategory: "market",
  },
  {
    name: "CryptoSlate",
    url: "https://cryptoslate.com/feed/",
    defaultCategory: "market",
  },
  {
    name: "BeInCrypto",
    url: "https://beincrypto.com/feed/",
    defaultCategory: "market",
  },
  {
    name: "CryptoPotato",
    url: "https://cryptopotato.com/feed/",
    defaultCategory: "market",
  },
  {
    name: "Bitcoin Magazine",
    // NOT /.rss/full/ — that 301s to an http:// URL and rss-parser hangs on
    // it rather than following. This path serves the same full text directly.
    url: "https://bitcoinmagazine.com/feed",
    defaultCategory: "bitcoin",
  },
  {
    name: "CoinDesk",
    url: "https://www.coindesk.com/arc/outboundfeeds/rss/",
    defaultCategory: "market",
    signalOnly: true,
  },
  {
    name: "Cointelegraph",
    url: "https://cointelegraph.com/rss",
    defaultCategory: "market",
    signalOnly: true,
  },
];

/** Feeds that carry article text, i.e. the ones a post can be written from. */
export const SOURCE_FEEDS = FEEDS.filter((f) => !f.signalOnly);

/**
 * Minimum words of source text before an item is worth writing from.
 *
 * The failure this guards against is the one the old pipeline shipped daily:
 * a 25-word blurb expanded into a 500-word article, where everything past the
 * blurb is invention. If a source is this thin, skip it — a story that matters
 * will come through another feed with a body attached.
 */
export const MIN_SOURCE_WORDS = 150;

// How many fresh items to process per feed, per run (caps AI cost).
// Lower than before because there are now five source feeds rather than two.
export const MAX_ITEMS_PER_FEED = 3;
