import Link from "next/link";
import { CATEGORY_COLOR } from "@/lib/category-style";
import { formatDate } from "@/lib/format";
import { FearGreedWidget } from "@/components/fear-greed-widget";
import { TrendingWidget } from "@/components/trending-widget";
import type { Post } from "@/types/post";

/**
 * Homepage / article-page sidebar: a compact "Trending" list of recent posts and
 * a "Popular tags" cloud. Sticky on large screens, stacks under content on mobile.
 */
export function Sidebar({
  latest,
  tags,
}: {
  latest: Post[];
  tags: string[];
}) {
  const trending = latest.slice(0, 6);

  return (
    <aside className="mt-12 flex flex-col gap-6 lg:mt-0 lg:sticky lg:top-20 lg:self-start">
      {trending.length > 0 ? (
        <div className="rounded-md panel p-5">
          <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-[0.3em] text-cyan text-glow-cyan">
            ◆ Trending
          </h2>
          <ul className="flex flex-col gap-4">
            {trending.map((post) => (
              <li key={post.slug} className="group flex gap-3">
                <span
                  aria-hidden
                  className="mt-1.5 h-2 w-2 shrink-0 rotate-45"
                  style={{
                    background: CATEGORY_COLOR[post.category],
                    boxShadow: `0 0 8px ${CATEGORY_COLOR[post.category]}`,
                  }}
                />
                <div className="min-w-0">
                  <Link
                    href={`/news/${post.slug}`}
                    className="line-clamp-2 text-xs font-bold leading-snug text-foreground transition-colors group-hover:text-cyan"
                  >
                    {post.title}
                  </Link>
                  <div className="mt-1 text-[10px] uppercase tracking-widest text-muted-foreground">
                    <time dateTime={post.publishedAt}>
                      {formatDate(post.publishedAt)}
                    </time>
                    {" // "}
                    {post.readingTimeMinutes}m
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <FearGreedWidget />
      <TrendingWidget />

      {tags.length > 0 ? (
        <div className="rounded-md panel p-5">
          <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-[0.3em] text-violet text-glow-violet">
            ◆ Popular tags
          </h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="rounded-sm border border-violet/40 px-2 py-1 text-[10px] uppercase tracking-widest text-violet transition-all hover:border-violet hover:[text-shadow:0_0_10px_var(--violet)]"
              >
                {tag}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </aside>
  );
}
