import Link from "next/link";
import { getTopCoins, formatPrice, formatPercent } from "@/lib/coingecko";

/**
 * Site-wide live price strip. Server component: fetches the top coins (cached at
 * the fetch layer) and renders a seamless CSS marquee. The track is duplicated so
 * the loop has no visible seam. The coins are non-interactive and a single pinned
 * "Live Prices" link points to /market — previously every coin (×2 tracks) was a
 * separate /market link, ~28 duplicates diluting the page's internal links.
 * Renders nothing if CoinGecko is unavailable.
 */
export async function MarketTicker() {
  const coins = await getTopCoins(14);
  if (coins.length === 0) return null;

  const items = coins.map((c) => {
    const up = c.change24h >= 0;
    const color = up ? "var(--acid)" : "var(--magenta)";
    return (
      <span
        key={c.id}
        className="flex shrink-0 items-center gap-2 px-4 text-[11px] tracking-wide"
      >
        <span className="font-display font-bold text-foreground/90">
          {c.symbol}
        </span>
        <span className="text-muted-foreground">{formatPrice(c.price)}</span>
        <span style={{ color }}>{formatPercent(c.change24h)}</span>
      </span>
    );
  });

  return (
    <div
      className="relative flex w-full items-stretch overflow-hidden border-b border-cyan/15 backdrop-blur"
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
      <div className="relative flex-1 overflow-hidden py-1.5">
        <div className="flex w-max animate-ticker hover:[animation-play-state:paused]">
          <div className="flex shrink-0">{items}</div>
          <div className="flex shrink-0" aria-hidden>
            {items}
          </div>
        </div>
      </div>
    </div>
  );
}
