import Image from "next/image";
import Link from "next/link";
import { CATEGORY_LABELS, type Post } from "@/types/post";
import { CATEGORY_COLOR } from "@/lib/category-style";
import { formatDate } from "@/lib/format";

/**
 * Article card, in three sizes:
 *
 * - `default` — image over kicker and headline. No excerpt: at this size it
 *   was three clamped lines of grey that pushed the meta row out of alignment
 *   across the grid.
 * - `featured` — horizontal, meant to span two columns and break up a row.
 * - `lead` — vertical but large, for the story that leads a category section.
 *
 * The title link is "stretched" (`after:absolute inset-0`) so the whole card
 * is one tap target.
 */
export function PostCard({
  post,
  variant = "default",
  className,
}: {
  post: Post;
  variant?: "default" | "featured" | "lead";
  className?: string;
}) {
  const accent = CATEGORY_COLOR[post.category];
  const featured = variant === "featured";
  const showExcerpt = variant !== "default";

  return (
    <article
      className={`group relative flex h-full flex-col overflow-hidden rounded-md panel transition-colors duration-200 hover:border-cyan/35 ${
        featured ? "md:flex-row md:items-stretch" : ""
      } ${className ?? ""}`}
    >
      {/* The aspect ratio lives on the wrapper so `fill` has a sized box to
          absolutely position into — this is what reserves layout space and
          keeps the card grid from shifting as thumbnails load. */}
      <div
        className={`relative shrink-0 overflow-hidden ${
          featured
            ? "aspect-[16/10] md:aspect-auto md:w-[320px]"
            : variant === "lead"
              ? "aspect-[16/9]"
              : "aspect-[16/9]"
        }`}
      >
        <Image
          src={post.coverImage || "/placeholder-cover.svg"}
          // Decorative: the card's own heading directly below carries the
          // title, so repeating it makes screen readers announce it twice.
          alt=""
          fill
          sizes={
            featured
              ? "(max-width: 767px) 100vw, 320px"
              : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 360px"
          }
          className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
        />
      </div>

      <div
        className={`flex flex-1 flex-col gap-2.5 ${featured ? "p-5 sm:p-6" : "p-4 sm:p-5"}`}
      >
        <span
          className="font-mono text-[10px] uppercase tracking-widest"
          style={{ color: accent }}
        >
          {CATEGORY_LABELS[post.category]}
        </span>

        <h3
          className={`font-display font-semibold leading-snug tracking-[-0.015em] text-foreground transition-colors group-hover:text-cyan ${
            featured
              ? "line-clamp-3 text-[22px] font-bold"
              : variant === "lead"
                ? "line-clamp-3 text-xl font-bold"
                : "line-clamp-3 text-[17px]"
          }`}
        >
          <Link
            href={`/news/${post.slug}`}
            className="after:absolute after:inset-0 after:z-10"
          >
            {post.title}
          </Link>
        </h3>

        {showExcerpt ? (
          <p className="line-clamp-3 font-[var(--font-body)] text-[15px] leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
        ) : null}

        <div className="mt-auto flex items-center gap-3 pt-2 font-mono text-[10px] uppercase tracking-widest text-text-low">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          <span aria-hidden>&middot;</span>
          <span>{post.readingTimeMinutes}m read</span>
        </div>
      </div>
    </article>
  );
}
