import type { Metadata } from "next";
import Link from "next/link";
import { getArchiveIndex } from "@/lib/posts";
import { absoluteUrl } from "@/lib/seo";
import { formatMonth } from "@/lib/format";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Archive",
  description: "Browse the full TheCryptoDesk news archive by month.",
  alternates: { canonical: absoluteUrl("/archive") },
};

export default async function ArchivePage() {
  const entries = await getArchiveIndex();

  // Group months under their year.
  const byYear = new Map<number, typeof entries>();
  for (const e of entries) {
    const list = byYear.get(e.year) ?? [];
    list.push(e);
    byYear.set(e.year, list);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-[0.25em] text-cyan text-glow-cyan">
          ◆ Archive
        </h1>
        <span className="h-px flex-1 bg-gradient-to-r from-cyan/60 to-transparent" />
      </div>

      {entries.length === 0 ? (
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          The archive is empty.
        </p>
      ) : (
        <div className="space-y-10">
          {years.map((year) => (
            <section key={year}>
              <h2 className="mb-4 font-display text-lg font-bold tracking-widest text-violet">
                {year}
              </h2>
              <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {byYear
                  .get(year)!
                  .sort((a, b) => b.month - a.month)
                  .map((e) => (
                    <li key={`${e.year}-${e.month}`}>
                      <Link
                        href={`/archive/${e.year}/${String(e.month).padStart(2, "0")}`}
                        className="flex items-center justify-between rounded-md panel px-4 py-3 transition-all hover:-translate-y-0.5 hover:text-cyan"
                      >
                        <span className="text-sm font-bold tracking-wide">
                          {formatMonth(e.year, e.month)}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {e.count}
                        </span>
                      </Link>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
