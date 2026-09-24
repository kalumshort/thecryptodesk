"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatPrice, formatPercent } from "@/lib/coingecko";

/**
 * Site-wide live price strip.
 *
 * Client component by design: this used to be an async server component that
 * awaited CoinGecko in the root layout, which pulled every route's effective
 * ISR window down to the coin fetch's 60s (see `src/app/api/ticker/route.ts`).
 * Fetching from the browser keeps the price cadence without touching any
 * page's cache lifetime.
 *
 * The strip sits directly above `<main>`, so its height is hard-locked at 30px
 * and the shell always renders — an empty or failed fetch must not collapse it,
 * or every page on the site gets a layout shift.
 */

/** Trimmed coin shape returned by `/api/ticker`. */
interface TickerCoin {
  id: string;
  symbol: string;
  price: number;
  change24h: number;
}

export function MarketTicker() {
  const [coins, setCoins] = useState<TickerCoin[]>([]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/ticker", { signal: controller.signal })
      .then((res) => (res.ok ? res.json() : []))
      .then((data: TickerCoin[]) => setCoins(data))
      // Abort on unmount and CoinGecko outages both land here: keep the empty
      // strip rather than surfacing an error in the chrome of every page.
      .catch(() => {});
    return () => controller.abort();
  }, []);

  const items = coins.map((c) => {
    const up = c.change24h >= 0;
    return (
      <span
        key={c.id}
        className="flex shrink-0 items-center gap-2 px-4 text-[11px] tracking-wide"
      >
        <span className="font-display font-bold text-foreground/90">
          {c.symbol}
        </span>
        <span className="text-muted-foreground">{formatPrice(c.price)}</span>
        <span style={{ color: up ? "var(--acid)" : "var(--magenta)" }}>
          {formatPercent(c.change24h)}
        </span>
      </span>
    );
  });

  return (
    <div
      className="relative flex h-[30px] w-full items-stretch overflow-hidden border-b border-cyan/15 backdrop-blur"
      style={{
        background: "color-mix(in oklch, var(--void-panel) 70%, transparent)",
      }}
    >
      <Link
        href="/market"
        className="z-10 flex shrink-0 items-center border-r border-cyan/15 px-3 text-[11px] font-bold uppercase tracking-widest text-cyan transition-all hover:[text-shadow:0_0_10px_var(--cyan)]"
      >
        Live&nbsp;Prices
      </Link>
      <div className="relative flex flex-1 items-center overflow-hidden">
        {items.length > 0 ? (
          <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
            <div className="flex shrink-0">{items}</div>
            {/* Duplicate track so the marquee loop has no visible seam. */}
            <div className="flex shrink-0" aria-hidden>
              {items}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
