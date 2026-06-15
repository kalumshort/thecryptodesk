"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { GlossaryTerm } from "@/lib/glossary";

/**
 * Client-side filterable glossary. Receives the full (alphabetically sorted)
 * term list from the server and narrows it as the user types or jumps to a
 * letter. The only interactive island on the glossary index.
 */
export function GlossaryList({ terms }: { terms: GlossaryTerm[] }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return terms;
    return terms.filter(
      (t) =>
        t.term.toLowerCase().includes(q) || t.short.toLowerCase().includes(q),
    );
  }, [query, terms]);

  // Letters that have at least one term, for the A–Z jump bar.
  const letters = useMemo(() => {
    const set = new Set(terms.map((t) => t.term[0].toUpperCase()));
    return Array.from(set).sort();
  }, [terms]);

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search terms…"
          style={{
            background: "color-mix(in oklch, var(--void-panel) 70%, transparent)",
          }}
          className="w-full rounded-sm border border-cyan/25 px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-cyan focus:[box-shadow:0_0_12px_-2px_var(--cyan)] sm:max-w-xs"
        />
        <div className="flex flex-wrap gap-1 text-[10px]">
          {letters.map((l) => (
            <a
              key={l}
              href={`#letter-${l}`}
              className="rounded-sm px-1.5 py-0.5 font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-cyan hover:[text-shadow:0_0_8px_var(--cyan)]"
            >
              {l}
            </a>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          No terms match “{query}”.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((t) => (
            <Link
              key={t.slug}
              id={`letter-${t.term[0].toUpperCase()}`}
              href={`/glossary/${t.slug}`}
              className="group rounded-md panel p-4 transition-all hover:-translate-y-0.5 hover:[border-color:color-mix(in_oklch,var(--cyan)_40%,transparent)]"
            >
              <h2 className="font-display text-sm font-bold uppercase tracking-wide text-foreground transition-colors group-hover:text-cyan">
                {t.term}
              </h2>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {t.short}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
