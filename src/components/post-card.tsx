import Link from "next/link";
import { CATEGORY_LABELS, type Post } from "@/types/post";
import { CATEGORY_COLOR } from "@/lib/category-style";
import { formatDate } from "@/lib/format";

export function PostCard({ post }: { post: Post }) {
  const accent = CATEGORY_COLOR[post.category];

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-md panel transition-all duration-300 hover:-translate-y-1"
      style={{ ["--accent" as string]: accent }}
    >
      {/* accent edge that ignites on hover */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px opacity-40 transition-opacity group-hover:opacity-100"
        style={{ background: accent, boxShadow: `0 0 14px ${accent}` }}
      />
      <Link href={`/news/${post.slug}`} className="block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.coverImage || "/placeholder-cover.svg"}
          alt=""
          loading="lazy"
          className="aspect-[16/9] w-full object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
        />
      </Link>
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
        <h2 className="line-clamp-2 font-display text-sm font-bold leading-snug tracking-wide text-foreground transition-colors group-hover:text-cyan">
          <Link href={`/news/${post.slug}`}>{post.title}</Link>
        </h2>
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {post.excerpt}
        </p>
        <div className="mt-auto flex items-center pt-3 text-[10px] uppercase tracking-widest text-muted-foreground">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        </div>
      </div>
    </article>
  );
}
