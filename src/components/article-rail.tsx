import Link from "next/link";
import { FearGreedWidget } from "@/components/fear-greed-widget";
import { TrendingWidget } from "@/components/trending-widget";
import { CATEGORY_LABELS, type Category, type Post } from "@/types/post";
import { CATEGORY_COLOR } from "@/lib/category-style";

/**
 * The article page's right rail.
 *
 * Replaces the old shared `Sidebar`, which put a trending list, a sentiment
 * gauge and a tag cloud beside the body — four things competing with the one
 * the reader came for. This carries only what helps mid-article: where you
 * are in the section, live prices, and where to go next.
 */
export function ArticleRail({
  category,
  more,
}: {
  category: Category;
  /** Same-category posts, excluding the one being read. */
  more: Post[];
}) {
  const accent = CATEGORY_COLOR[category];

  return (
    <aside className="flex min-w-0 flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
      {more.length > 0 ? (
        <nav
          aria-label={`More in ${CATEGORY_LABELS[category]}`}
          className="overflow-hidden rounded-md panel"
        >
          <h2
            className="border-b border-border px-5 py-3.5 font-mono text-[11px] font-bold uppercase tracking-[0.2em]"
            style={{ color: accent }}
          >
            More in {CATEGORY_LABELS[category]}
          </h2>
          {more.map((post) => (
            <Link
              key={post.slug}
              href={`/news/${post.slug}`}
              className="block border-b border-border px-5 py-3.5 font-display text-[14.5px] font-semibold leading-snug text-foreground transition-colors last:border-b-0 hover:bg-cyan/5 hover:text-cyan"
            >
              {post.title}
            </Link>
          ))}
        </nav>
      ) : null}

      <TrendingWidget />

      <FearGreedWidget />

      <div className="rounded-md panel p-5">
        <h2 className="mb-2 font-display text-base font-bold text-foreground">
          New to crypto?
        </h2>
        <p className="font-[var(--font-body)] text-[14.5px] leading-relaxed text-muted-foreground">
          Our guides explain the mechanics behind the headlines, in plain
          English.
        </p>
        <Link
          href="/learn"
          className="mt-3 inline-block font-mono text-[11px] uppercase tracking-widest text-cyan"
        >
          Browse guides
        </Link>
      </div>
    </aside>
  );
}
