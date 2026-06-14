import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/post-body";
import { PostCard } from "@/components/post-card";
import { SectionHeading } from "@/components/section-heading";
import { Sidebar } from "@/components/sidebar";
import {
  getAllPublishedSlugs,
  getLatestPosts,
  getPostBySlug,
  getSimilarPosts,
} from "@/lib/posts";
import { popularTags } from "@/lib/tags";
import { buildPostMetadata, newsArticleJsonLd } from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { CATEGORY_LABELS } from "@/types/post";
import { CATEGORY_COLOR } from "@/lib/category-style";

// ISR: serve cached HTML, refresh in the background every 5 minutes.
export const revalidate = 300;
// Allow on-demand rendering of posts not pre-built at deploy time.
export const dynamicParams = true;

type Params = { params: Promise<{ slug: string }> };

// Pre-render the most recent posts at build time; the rest render on demand.
export async function generateStaticParams() {
  const slugs = await getAllPublishedSlugs();
  return slugs.slice(0, 50).map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) return { title: "Not found" };
  return buildPostMetadata(post);
}

export default async function PostPage({ params }: Params) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const accent = CATEGORY_COLOR[post.category];
  const [similar, latest] = await Promise.all([
    getSimilarPosts(post.category, post.slug, 3),
    getLatestPosts(12),
  ]);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <article className="min-w-0">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(newsArticleJsonLd(post)),
        }}
      />

      <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-widest">
        <Link
          href={`/category/${post.category}`}
          className="font-display font-bold"
          style={{ color: accent, textShadow: `0 0 10px ${accent}` }}
        >
          ◆ {CATEGORY_LABELS[post.category]}
        </Link>
        <span className="text-muted-foreground">
          <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
          {" // "}
          {post.readingTimeMinutes}m read
        </span>
      </div>

      <h1 className="font-display text-3xl font-extrabold leading-tight tracking-wide text-foreground text-glow-cyan sm:text-4xl">
        {post.title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        {post.excerpt}
      </p>

      {post.coverImage ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.coverImage}
            alt=""
            className="mt-8 aspect-[16/9] w-full rounded-md object-cover glow-border-cyan"
          />
        </>
      ) : null}

      <div className="my-8 h-px bg-gradient-to-r from-cyan/60 via-violet/30 to-transparent" />

      <PostBody content={post.content} />

      <div className="my-8 h-px bg-gradient-to-r from-violet/60 to-transparent" />

      <footer className="text-xs leading-relaxed text-muted-foreground">
        <p>◆ Synthesised &amp; rewritten by AI for clarity.</p>
        {post.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/tag/${encodeURIComponent(tag)}`}
                className="rounded-sm border border-violet/40 px-2 py-1 uppercase tracking-widest text-violet transition-all hover:border-violet hover:[text-shadow:0_0_10px_var(--violet)]"
              >
                {tag}
              </Link>
            ))}
          </div>
        ) : null}
      </footer>

      {similar.length > 0 ? (
        <section className="mt-14">
          <SectionHeading label="Similar signals" accent={accent} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      ) : null}
      </article>

      <Sidebar latest={latest} tags={popularTags(latest)} />
    </div>
  );
}
