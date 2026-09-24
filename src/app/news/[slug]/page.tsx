import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/post-body";
import { PostCard } from "@/components/post-card";
import { SectionHeading } from "@/components/section-heading";
import { ArticleRail } from "@/components/article-rail";
import { ReadingProgress } from "@/components/reading-progress";
import { BrandMark } from "@/components/site-logo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import {
  getAllPublishedSlugs,
  getPostBySlug,
  getSimilarPosts,
} from "@/lib/posts";
import {
  breadcrumbJsonLd,
  buildPostMetadata,
  newsArticleJsonLd,
} from "@/lib/seo";
import { formatDate } from "@/lib/format";
import { CATEGORY_LABELS } from "@/types/post";
import { CATEGORY_COLOR } from "@/lib/category-style";
import { EDITORIAL } from "@/lib/authors";
import { GlossaryLinks } from "@/components/glossary-links";

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
  // Six: three for the rail, three for the "Read next" grid.
  const similar = await getSimilarPosts(post.category, post.slug, 6);
  const railPosts = similar.slice(0, 3);
  const readNext = similar.slice(3, 6);

  // One breadcrumb trail, shared by the JSON-LD and the visible UI below.
  const crumbs = [
    { name: "Home", path: "/" },
    {
      name: CATEGORY_LABELS[post.category],
      path: `/category/${post.category}`,
    },
    { name: post.title, path: `/news/${post.slug}` },
  ];

  return (
    <div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(newsArticleJsonLd(post)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs)),
        }}
      />

      <ReadingProgress />

      <div className="mx-auto max-w-6xl px-4 pt-6">
        <Breadcrumbs items={crumbs} />
      </div>

      {/* Headline block: sits above the cover so the story is legible before
          any image loads, and so a post without one still reads as an article
          rather than a gap. */}
      <header className="mx-auto max-w-6xl px-4 pb-7">
        <Link
          href={`/category/${post.category}`}
          className="font-mono text-[11px] font-bold uppercase tracking-widest"
          style={{ color: accent }}
        >
          {CATEGORY_LABELS[post.category]}
        </Link>
        <h1 className="mt-3 max-w-[900px] font-display text-[32px] font-bold leading-[1.08] tracking-[-0.035em] text-foreground sm:text-5xl">
          {post.title}
        </h1>
        {/* No standfirst here on purpose. The generator writes `excerpt` as a
            one-sentence summary of the same lede the body opens with, so
            printing both stacks two near-identical sentences. The excerpt
            still does its work as the meta description and on cards. */}

        <div className="mt-6 flex flex-wrap items-center gap-4 border-t border-border pt-5">
          <span className="flex size-[38px] shrink-0 items-center justify-center rounded-full panel text-cyan">
            <BrandMark size={17} solid />
          </span>
          <span className="flex flex-col gap-0.5">
            <Link
              href={EDITORIAL.url}
              className="font-display text-sm font-semibold text-foreground transition-colors hover:text-cyan"
            >
              {EDITORIAL.name}
            </Link>
            <span className="font-mono text-[11px] uppercase tracking-widest text-text-low">
              <time dateTime={post.publishedAt}>
                {formatDate(post.publishedAt)}
              </time>
              {` · ${post.readingTimeMinutes}m read`}
            </span>
          </span>
        </div>
      </header>

      {post.coverImage ? (
        <div className="mx-auto max-w-6xl px-4 pb-9">
          <Image
            src={post.coverImage}
            alt={post.title}
            // Explicit intrinsic size reserves the box before the image
            // arrives — without it every article page shifted on load.
            width={1200}
            height={675}
            sizes="(max-width: 1279px) 100vw, 1152px"
            preload
            className="aspect-[16/9] w-full rounded-md border border-border object-cover sm:aspect-[21/9]"
          />
        </div>
      ) : null}

      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-10 lg:grid-cols-[minmax(0,1fr)_336px]">
        <article className="min-w-0">
          <PostBody content={post.content} />

          {post.tags.length > 0 ? (
            <div className="mt-9 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/tag/${encodeURIComponent(tag)}`}
                  className="rounded-sm border border-violet/40 px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-violet transition-colors hover:border-violet hover:bg-violet/10"
                >
                  {tag}
                </Link>
              ))}
            </div>
          ) : null}

          <GlossaryLinks keywords={post.keywords} tags={post.tags} />

          {/* Source attribution as a card rather than a line of grey text:
              linking out to the original is a trust signal worth showing. */}
          <footer className="mt-9 flex flex-col gap-4 rounded-md panel p-5 sm:flex-row sm:items-center">
            <div className="flex-1">
              <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-low">
                Reporting based on
              </h2>
              <p className="mt-2 font-display text-base font-semibold text-foreground">
                {post.sourceName || "Third-party reporting"}
              </p>
              <p className="mt-1.5 font-[var(--font-body)] text-[14.5px] leading-relaxed text-muted-foreground">
                Summarised by{" "}
                <Link href={EDITORIAL.url} className="text-foreground/85">
                  {EDITORIAL.name}
                </Link>
                . Read our{" "}
                <Link href="/editorial-policy" className="text-cyan">
                  editorial policy
                </Link>
                .
              </p>
            </div>
            {post.sourceUrl ? (
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noopener noreferrer nofollow"
                className="flex shrink-0 items-center justify-center gap-2 rounded-sm border border-cyan px-4 py-2.5 font-mono text-[11px] uppercase tracking-widest text-cyan transition-colors hover:bg-cyan/10"
              >
                Read the original
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  aria-hidden="true"
                >
                  <path d="M7 17L17 7M9 7h8v8" />
                </svg>
              </a>
            ) : null}
          </footer>
        </article>

        <ArticleRail category={post.category} more={railPosts} />
      </div>

      {readNext.length > 0 ? (
        <section className="mx-auto max-w-6xl px-4 pb-14">
          <SectionHeading label="Read next" accent={accent} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {readNext.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
