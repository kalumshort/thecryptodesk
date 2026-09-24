import { NextResponse } from "next/server";
import { getTopCoins } from "@/lib/coingecko";

/**
 * Top coins with a 7-day sparkline, for the homepage markets band.
 *
 * Separate from the page render for the same reason as `/api/ticker`: without
 * `cacheComponents`, one route render shares a work-unit store, so awaiting a
 * 60s-cached CoinGecko fetch inside a page would drag that page's ISR window
 * down to 60s. A route handler keeps the short window contained here.
 *
 * The sparkline is downsampled to ~24 points — enough to draw a 56px-wide
 * polyline, and a fraction of CoinGecko's hourly series over the wire.
 */
export const revalidate = 60;

const POINTS = 24;

/**
 * Stablecoins rank high by market cap but draw a flat line at 0.00%, which
 * wastes a cell in a four-slot band. Fetch deeper and skip them.
 */
const STABLE = new Set(["USDT", "USDC", "DAI", "FDUSD", "USDE", "TUSD", "PYUSD", "USDS"]);
const SHOWN = 4;

/** Evenly sample `n` values from a series, always keeping the last one. */
function downsample(series: number[], n: number): number[] {
  if (series.length <= n) return series;
  const step = (series.length - 1) / (n - 1);
  return Array.from({ length: n }, (_, i) =>
    series[Math.round(i * step)],
  );
}

export async function GET() {
  const coins = (await getTopCoins(12))
    .filter((c) => !STABLE.has(c.symbol))
    .slice(0, SHOWN);
  return NextResponse.json(
    coins.map((c) => ({
      id: c.id,
      symbol: c.symbol,
      price: c.price,
      change24h: c.change24h,
      spark: downsample(c.sparkline7d, POINTS),
    })),
    {
      headers: {
        "cache-control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
