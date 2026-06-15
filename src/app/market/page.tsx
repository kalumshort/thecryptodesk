import type { Metadata } from "next";
import { Sparkline } from "@/components/sparkline";
import {
  getTopCoins,
  getGlobalMarket,
  formatPrice,
  formatCompactUsd,
  formatPercent,
} from "@/lib/coingecko";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Crypto Market Prices",
  description:
    "Live cryptocurrency prices, market caps, 24h and 7d changes for the top coins by market capitalisation.",
  alternates: { canonical: absoluteUrl("/market") },
};

function ChangeCell({ value }: { value: number }) {
  const color = value >= 0 ? "var(--acid)" : "var(--magenta)";
  return (
    <span style={{ color }} className="font-bold">
      {formatPercent(value)}
    </span>
  );
}

function StatCard({
  label,
  value,
  accent,
  sub,
}: {
  label: string;
  value: string;
  accent: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className="rounded-md panel p-4">
      <div className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
        {label}
      </div>
      <div
        className="mt-1 font-display text-lg font-bold"
        style={{ color: accent, textShadow: `0 0 12px ${accent}` }}
      >
        {value}
      </div>
      {sub ? <div className="mt-1 text-[11px]">{sub}</div> : null}
    </div>
  );
}

export default async function MarketPage() {
  const [coins, global] = await Promise.all([
    getTopCoins(50),
    getGlobalMarket(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-[0.25em] text-cyan text-glow-cyan">
          ◆ Markets
        </h1>
        <span className="h-px flex-1 bg-gradient-to-r from-cyan to-transparent" />
      </div>

      {global ? (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Market Cap"
            value={formatCompactUsd(global.totalMarketCap)}
            accent="var(--cyan)"
            sub={<ChangeCell value={global.marketCapChange24h} />}
          />
          <StatCard
            label="24h Volume"
            value={formatCompactUsd(global.totalVolume24h)}
            accent="var(--violet)"
          />
          <StatCard
            label="BTC Dominance"
            value={`${global.btcDominance.toFixed(1)}%`}
            accent="var(--amber)"
          />
          <StatCard
            label="Tracked Coins"
            value={`${coins.length}`}
            accent="var(--acid)"
          />
        </div>
      ) : null}

      {coins.length === 0 ? (
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Market feed offline. Check back shortly.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-md panel">
          <table className="w-full min-w-[640px] text-xs">
            <thead>
              <tr className="border-b border-cyan/15 text-[10px] uppercase tracking-widest text-muted-foreground">
                <th className="px-3 py-3 text-left font-bold">#</th>
                <th className="px-3 py-3 text-left font-bold">Coin</th>
                <th className="px-3 py-3 text-right font-bold">Price</th>
                <th className="px-3 py-3 text-right font-bold">24h</th>
                <th className="px-3 py-3 text-right font-bold">7d</th>
                <th className="hidden px-3 py-3 text-right font-bold sm:table-cell">
                  Market Cap
                </th>
                <th className="hidden px-3 py-3 text-right font-bold md:table-cell">
                  Volume (24h)
                </th>
                <th className="hidden px-3 py-3 text-right font-bold lg:table-cell">
                  7d Chart
                </th>
              </tr>
            </thead>
            <tbody>
              {coins.map((c) => (
                <tr
                  key={c.id}
                  className="border-b border-cyan/5 transition-colors hover:bg-cyan/5"
                >
                  <td className="px-3 py-3 text-muted-foreground">{c.rank}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={c.image}
                        alt=""
                        width={20}
                        height={20}
                        loading="lazy"
                        className="h-5 w-5 rounded-full"
                      />
                      <span className="font-bold text-foreground">{c.name}</span>
                      <span className="text-muted-foreground">{c.symbol}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-right font-bold text-foreground">
                    {formatPrice(c.price)}
                  </td>
                  <td className="px-3 py-3 text-right">
                    <ChangeCell value={c.change24h} />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <ChangeCell value={c.change7d} />
                  </td>
                  <td className="hidden px-3 py-3 text-right text-muted-foreground sm:table-cell">
                    {formatCompactUsd(c.marketCap)}
                  </td>
                  <td className="hidden px-3 py-3 text-right text-muted-foreground md:table-cell">
                    {formatCompactUsd(c.volume24h)}
                  </td>
                  <td className="hidden px-3 py-3 lg:table-cell">
                    <div className="flex justify-end">
                      <Sparkline data={c.sparkline7d} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-6 text-[10px] uppercase tracking-widest text-muted-foreground">
        Data via CoinGecko · refreshed every minute · not financial advice
      </p>
    </div>
  );
}
