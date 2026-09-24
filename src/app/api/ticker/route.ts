import { NextResponse } from "next/server";
import { getTopCoins } from "@/lib/coingecko";

/**
 * Live price strip data for the site-wide `<MarketTicker>`.
 *
 * This exists purely to keep CoinGecko OUT of the page render path. Without
 * `cacheComponents`, an entire route render shares one work-unit store, and any
 * `fetch` with a lower `revalidate` mutates it — so awaiting a 60s-cached coin
 * fetch inside the root layout silently dragged EVERY route's ISR window down
 * to 60s, overriding `revalidate = 300` on articles and `3600` on the archive.
 * A route handler gets its own cache entry, so this 60s stays contained here.
 */
export const revalidate = 60;

export async function GET() {
  const coins = await getTopCoins(14);
  return NextResponse.json(
    coins.map((c) => ({
      id: c.id,
      symbol: c.symbol,
      price: c.price,
      change24h: c.change24h,
    })),
    {
      headers: {
        "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
