import Link from "next/link";
import { CATEGORY_LABELS, type Post } from "@/types/post";
import { CATEGORY_COLOR } from "@/lib/category-style";
import { formatDate } from "@/lib/format";

/**
 * Article card. `variant="featured"` renders a larger, horizontal card used for
 * the first story of a section (visual hierarchy); pass `className` (e.g.
 * `sm:col-span-2`) to let it span more grid columns. The title link is
 * "stretched" (`after:absolute inset-0`) so the whole card is one tap target.
 */
export function PostCard({
  post,
  variant = "default",
  className,
}: {
  post: Post;
  variant?: "default" | "featured";
  className?: string;
}) {
  const accent = CATEGORY_COLOR[post.category];
  const featured = variant === "featured";

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-md panel transition-all duration-300 hover:-translate-y-1 ${
        featured ? "md:grid md:grid-cols-2 md:items-stretch" : ""
      } ${className ?? ""}`}
      style={{ ["--accent" as string]: accent }}
    >
      {/* accent edge that ignites on hover */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 z-20 h-px opacity-40 transition-opacity group-hover:opacity-100"
        style={{ background: accent, boxShadow: `0 0 14px ${accent}` }}
      />
      <div className="overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.coverImage || "/placeholder-cover.svg"}
          alt={post.title}
          loading="lazy"
          className={`w-full object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100 ${
            featured ? "aspect-[16/10] md:aspect-auto md:h-full" : "aspect-[16/9]"
          }`}
        />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest">
          <span
            className="font-display font-bold"
            style={{ color: accent, textShadow: `0 0 10px ${accent}` }}
          >
            {CATEGORY_LABELS[post.category]}
          </span>
          <span className="text-muted-foreground">
            {post.readingTimeMinutes}m read
          </span>
        </div>
        <h3
          className={`line-clamp-3 font-display font-bold leading-snug tracking-wide text-foreground transition-colors group-hover:text-cyan ${
            featured ? "text-lg" : "text-sm"
          }`}
        >
          <Link
            href={`/news/${post.slug}`}
            className="after:absolute after:inset-0 after:z-10"
          >
            {post.title}
          </Link>
        </h3>
        <p
          className={`line-clamp-3 leading-relaxed text-muted-foreground ${
            featured ? "text-sm" : "text-xs"
          }`}
        >
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center pt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        </div>
      </div>
    </article>
  );
}
