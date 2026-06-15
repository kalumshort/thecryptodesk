// CoinGecko market data (free public API — no key required).
//
// Reads are cached at the fetch layer via Next's `revalidate` so a burst of
// page renders shares one upstream call and we stay well under the free-tier
// rate limit. Every fetcher degrades to a safe empty value on failure so a
// CoinGecko outage renders an empty state instead of crashing the page —
// mirroring the `onReadError` approach in `src/lib/posts.ts`.

const BASE = "https://api.coingecko.com/api/v3";

// Cache windows (seconds). Prices move fast; global stats are slower.
const COINS_REVALIDATE = 60;
const GLOBAL_REVALIDATE = 120;
const TRENDING_REVALIDATE = 300;

/** One coin from `/coins/markets`. */
export interface Coin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  rank: number;
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number; // percent
  change7d: number; // percent
  sparkline7d: number[];
}

/** Aggregate market figures from `/global`. */
export interface GlobalMarket {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number; // percent
  marketCapChange24h: number; // percent
}

/** One coin from `/search/trending`. */
export interface TrendingCoin {
  id: string;
  symbol: string;
  name: string;
  rank: number | null;
  thumb: string;
}

async function fetchJson<T>(
  path: string,
  revalidate: number,
  scope: string,
): Promise<T | null> {
  try {
    const res = await fetch(`${BASE}${path}`, {
      headers: { accept: "application/json" },
      next: { revalidate },
    });
    if (!res.ok) {
      console.error(`[coingecko] ${scope} HTTP ${res.status}`);
      return null;
    }
    return (await res.json()) as T;
  } catch (err) {
    console.error(`[coingecko] ${scope} failed:`, err);
    return null;
  }
}

interface RawCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  market_cap_rank: number;
  current_price: number;
  market_cap: number;
  total_volume: number;
  price_change_percentage_24h_in_currency?: number;
  price_change_percentage_7d_in_currency?: number;
  price_change_percentage_24h?: number;
  sparkline_in_7d?: { price: number[] };
}

/** Top `n` coins by market cap, with 24h/7d change and a 7-day sparkline. */
export async function getTopCoins(n = 50): Promise<Coin[]> {
  const data = await fetchJson<RawCoin[]>(
    `/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${n}&page=1&sparkline=true&price_change_percentage=24h%2C7d`,
    COINS_REVALIDATE,
    "getTopCoins",
  );
  if (!data) return [];
  return data.map((c) => ({
    id: c.id,
    symbol: c.symbol.toUpperCase(),
    name: c.name,
    image: c.image,
    rank: c.market_cap_rank,
    price: c.current_price ?? 0,
    marketCap: c.market_cap ?? 0,
    volume24h: c.total_volume ?? 0,
    change24h:
      c.price_change_percentage_24h_in_currency ??
      c.price_change_percentage_24h ??
      0,
    change7d: c.price_change_percentage_7d_in_currency ?? 0,
    sparkline7d: c.sparkline_in_7d?.price ?? [],
  }));
}

interface RawGlobal {
  data?: {
    total_market_cap?: { usd?: number };
    total_volume?: { usd?: number };
    market_cap_percentage?: { btc?: number };
    market_cap_change_percentage_24h_usd?: number;
  };
}

/** Aggregate market stats, or null if unavailable. */
export async function getGlobalMarket(): Promise<GlobalMarket | null> {
  const raw = await fetchJson<RawGlobal>(
    "/global",
    GLOBAL_REVALIDATE,
    "getGlobalMarket",
  );
  const d = raw?.data;
  if (!d) return null;
  return {
    totalMarketCap: d.total_market_cap?.usd ?? 0,
    totalVolume24h: d.total_volume?.usd ?? 0,
    btcDominance: d.market_cap_percentage?.btc ?? 0,
    marketCapChange24h: d.market_cap_change_percentage_24h_usd ?? 0,
  };
}

interface RawTrending {
  coins?: {
    item: {
      id: string;
      symbol: string;
      name: string;
      market_cap_rank: number | null;
      thumb: string;
    };
  }[];
}

/** Currently trending coins (CoinGecko search popularity). */
export async function getTrendingCoins(n = 7): Promise<TrendingCoin[]> {
  const raw = await fetchJson<RawTrending>(
    "/search/trending",
    TRENDING_REVALIDATE,
    "getTrendingCoins",
  );
  if (!raw?.coins) return [];
  return raw.coins.slice(0, n).map(({ item }) => ({
    id: item.id,
    symbol: item.symbol.toUpperCase(),
    name: item.name,
    rank: item.market_cap_rank,
    thumb: item.thumb,
  }));
}

/** Format a USD price with sensible precision for large and sub-cent values. */
export function formatPrice(value: number): string {
  if (value >= 1) {
    return value.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 2,
    });
  }
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 6,
  });
}

/** Compact USD for big figures, e.g. "$1.2T", "$840.5B". */
export function formatCompactUsd(value: number): string {
  return value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 2,
  });
}

/** Signed percent, e.g. "+3.42%" / "-1.08%". */
export function formatPercent(value: number): string {
  return `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}
