import Link from "next/link";
import { getTrendingCoins } from "@/lib/coingecko";

/**
 * Sidebar "Trending" coins from CoinGecko search popularity. Async server
 * component; renders nothing if the feed is unavailable.
 */
export async function TrendingWidget() {
  const coins = await getTrendingCoins(7);
  if (coins.length === 0) return null;

  return (
    <div className="rounded-md panel p-5">
      <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-[0.3em] text-amber [text-shadow:0_0_10px_var(--amber)]">
        ◆ Trending coins
      </h2>
      <ul className="flex flex-col gap-3">
        {coins.map((c, i) => (
          <li key={c.id}>
            <Link
              href="/market"
              className="group flex items-center gap-3 text-xs"
            >
              <span className="w-4 shrink-0 text-right text-[10px] text-muted-foreground">
                {i + 1}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={c.thumb}
                alt=""
                width={18}
                height={18}
                loading="lazy"
                className="h-[18px] w-[18px] rounded-full"
              />
              <span className="min-w-0 truncate font-bold text-foreground transition-colors group-hover:text-amber">
                {c.name}
              </span>
              <span className="ml-auto shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
                {c.symbol}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
