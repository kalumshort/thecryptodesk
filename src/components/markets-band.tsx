"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice, formatPercent } from "@/lib/coingecko";

/**
 * Homepage markets band: four coins with a 7-day sparkline.
 *
 * Client-side by design — see `src/app/api/markets/route.ts`. The row keeps a
 * fixed height and renders its cells whether or not data has arrived, so the
 * band never collapses and shifts the grid below it.
 */

interface BandCoin {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
  spark: number[];
}

const W = 56;
const H = 30;

/** Map a price series onto a polyline inside the sparkline box. */
function points(series: number[]): string {
  if (series.length < 2) return "";
  const min = Math.min(...series);
  const max = Math.max(...series);
  const span = max - min || 1;
  return series
    .map((v, i) => {
      const x = (i / (series.length - 1)) * W;
      // Invert: SVG y grows downward, price should grow upward.
      const y = H - 2 - ((v - min) / span) * (H - 4);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

const PLACEHOLDERS = ["BTC", "ETH", "SOL", "XRP"];

export function MarketsBand() {
  const [coins, setCoins] = useState<BandCoin[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/markets", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: BandCoin[]) => setCoins(data))
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const cells = coins.length > 0 ? coins : null;

  return (
    <div className="mb-10 grid grid-cols-2 overflow-hidden rounded-md panel sm:grid-cols-3 lg:grid-cols-5">
      {cells
        ? cells.map((c) => {
            const up = c.change24h >= 0;
            const color = up ? "var(--acid)" : "var(--magenta)";
            return (
              <Link
                key={c.id}
                href="/market"
                className="flex h-[74px] items-center gap-3 border-b border-r border-border px-4 transition-colors last:border-r-0 hover:bg-cyan/5 lg:border-b-0"
              >
                <span className="flex min-w-0 flex-1 flex-col gap-0.5 font-mono">
                  <span className="text-[11px] tracking-widest text-muted-foreground">
                    {c.symbol}
                  </span>
                  <span className="text-[15px] text-foreground">
                    {formatPrice(c.price)}
                  </span>
                  <span className="text-[11px]" style={{ color }}>
                    {formatPercent(c.change24h)}
                  </span>
                </span>
                <svg
                  width={W}
                  height={H}
                  viewBox={`0 0 ${W} ${H}`}
                  className="shrink-0"
                  aria-hidden="true"
                >
                  <polyline
                    points={points(c.spark)}
                    fill="none"
                    stroke={color}
                    strokeWidth="1.6"
                  />
                </svg>
              </Link>
            );
          })
        : PLACEHOLDERS.map((symbol) => (
            <span
              key={symbol}
              className="flex h-[74px] items-center border-b border-r border-border px-4 font-mono text-[11px] tracking-widest text-muted-foreground lg:border-b-0"
            >
              {symbol}
            </span>
          ))}

      <Link
        href="/market"
        className="flex h-[74px] items-center justify-between gap-2 px-4 font-mono text-[11px] uppercase tracking-widest text-cyan transition-colors hover:bg-cyan/5"
      >
        All prices
        <svg
          width="15"
          height="15"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.4"
          aria-hidden="true"
        >
          <path d="M5 12h13M13 6l6 6-6 6" />
        </svg>
      </Link>
    </div>
  );
}
