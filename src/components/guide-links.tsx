import Link from "next/link";
import { SectionHeading } from "@/components/section-heading";
import { getGuides } from "@/lib/guides";
import { LEVEL_LABELS } from "@/types/guide";
import { CATEGORY_LABELS, type Category } from "@/types/post";

/**
 * "Learn more" block for a category hub — the news side of the site and the
 * Learn hub previously had no links between them in either direction, which
 * left the guides with almost no internal links pointing at them.
 *
 * Guides carry a `topic` and `tags` rather than a news `category`, so relevance
 * is scored against these keywords and falls back to beginner material when a
 * category has no close match (NFTs and regulation currently have none).
 */
const CATEGORY_KEYWORDS: Record<Category, string[]> = {
  bitcoin: ["bitcoin", "basics", "wallets"],
  ethereum: ["ethereum", "gas", "basics"],
  altcoins: ["tokens", "coins", "stablecoins", "basics"],
  defi: ["defi", "staking", "yield"],
  nft: ["tokens", "wallets", "basics"],
  regulation: ["security", "scams", "basics"],
  market: ["trading", "market", "volatility"],
};

export async function GuideLinks({
  category,
  limit = 3,
}: {
  category: Category;
  limit?: number;
}) {
  const guides = await getGuides();
  if (guides.length === 0) return null;

  const keywords = CATEGORY_KEYWORDS[category];
  const scored = guides
    .map((guide) => {
      const haystack = [guide.title, guide.topic, ...guide.tags]
        .join(" ")
        .toLowerCase();
      const score = keywords.reduce(
        (n, kw) => (haystack.includes(kw) ? n + 1 : n),
        0,
      );
      return { guide, score };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ guide }) => guide);

  if (scored.length === 0) return null;

  return (
    <section className="mt-16">
      <SectionHeading label="Learn the basics" accent="var(--acid)" href="/learn" />
      <p className="-mt-2 mb-5 text-sm text-muted-foreground">
        New to {CATEGORY_LABELS[category]}? These explainers cover the mechanics
        behind the headlines.
      </p>
      <ul className="grid gap-3 sm:grid-cols-3">
        {scored.map((guide) => (
          <li key={guide.slug}>
            <Link
              href={`/learn/${guide.slug}`}
              className="group flex h-full flex-col gap-2 rounded-md panel p-4 transition-all hover:-translate-y-0.5"
            >
              <span className="font-display text-[10px] font-bold uppercase tracking-widest text-acid">
                {LEVEL_LABELS[guide.level]}
              </span>
              <span className="text-sm font-bold leading-snug text-foreground transition-colors group-hover:text-acid">
                {guide.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
