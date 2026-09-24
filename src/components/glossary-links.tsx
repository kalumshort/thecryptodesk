import Link from "next/link";
import { GLOSSARY } from "@/lib/glossary";

/**
 * "Terms in this article" block.
 *
 * Articles and the glossary previously had no links between them, leaving 39
 * hand-written definition pages with almost no internal links. Matching is
 * driven by the post's own keywords and tags against each term's title and
 * slug, so a term only appears when the article actually concerns it.
 */

/** Normalise for comparison: lowercase, strip punctuation, collapse spaces. */
function norm(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, " ")
    .trim();
}

export function GlossaryLinks({
  keywords,
  tags,
  limit = 4,
}: {
  keywords: string[];
  tags: string[];
  limit?: number;
}) {
  const needles = [...keywords, ...tags].map(norm).filter(Boolean);
  if (needles.length === 0) return null;

  const matches = GLOSSARY.filter((entry) => {
    const term = norm(entry.term);
    const slug = norm(entry.slug);
    return needles.some((n) => n === term || n === slug);
  }).slice(0, limit);

  if (matches.length === 0) return null;

  return (
    <section className="mt-10 rounded-md panel p-5">
      <h2 className="mb-3 font-display text-xs font-bold uppercase tracking-[0.3em] text-amber [text-shadow:0_0_10px_var(--amber)]">
        Terms in this article
      </h2>
      <ul className="flex flex-wrap gap-2">
        {matches.map((entry) => (
          <li key={entry.slug}>
            <Link
              href={`/glossary/${entry.slug}`}
              className="inline-block rounded-sm border border-amber/40 px-2 py-1 text-xs uppercase tracking-widest text-amber transition-all hover:border-amber hover:[text-shadow:0_0_10px_var(--amber)]"
            >
              {entry.term}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
