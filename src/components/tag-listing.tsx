import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { PostCard } from "@/components/post-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Diamond } from "@/components/diamond";
import { Pagination, pageHref } from "@/components/pagination";
import { POSTS_PER_PAGE, getPostsByTagPage } from "@/lib/posts";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  collectionPageJsonLd,
} from "@/lib/seo";

/**
 * Shared body for `/tag/[tag]` and `/tag/[tag]/page/[page]`.
 *
 * Tag pages are auto-generated from AI-assigned tags, so a tag with only one or
 * two articles is a near-duplicate of a category page with nothing unique to
 * offer. Those stay `noindex, follow` — crawlable for link discovery, but kept
 * out of the index.
 */
const THIN_TAG_THRESHOLD = 3;

/**
 * Tag params arrive URL-encoded from `encodeURIComponent` links. Decoding is
 * wrapped because a stray `%` makes `decodeURIComponent` throw, which would
 * 500 the page rather than render an empty tag.
 */
export function decodeTag(raw: string): string {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

/** Deduped so generateMetadata and the page body share one Firestore read. */
export const getTagPage = cache((label: string, page: number) =>
  getPostsByTagPage(label, page),
);

function basePath(label: string) {
  // Re-encode from the decoded label so a multi-word tag yields
  // `/tag/bitcoin%20etf`, never a URL containing a literal space.
  return `/tag/${encodeURIComponent(label)}`;
}

export async function tagMetadata(
  label: string,
  page: number,
): Promise<Metadata> {
  const { total } = await getTagPage(label, page);
  const suffix = page > 1 ? ` — Page ${page}` : "";
  return {
    title: `#${label}${suffix}`,
    description: `Cryptocurrency news and analysis tagged "${label}".`,
    alternates: { canonical: absoluteUrl(pageHref(basePath(label), page)) },
    robots:
      total < THIN_TAG_THRESHOLD ? { index: false, follow: true } : undefined,
  };
}

export async function TagListing({
  label,
  page,
}: {
  label: string;
  page: number;
}) {
  const base = basePath(label);
  const { posts, totalPages, total } = await getTagPage(label, page);

  if (page > 1 && posts.length === 0) notFound();

  const crumbs = [
    { name: "Home", path: "/" },
    { name: `#${label}`, path: base },
    ...(page > 1
      ? [{ name: `Page ${page}`, path: pageHref(base, page) }]
      : []),
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs)),
        }}
      />
      {posts.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              collectionPageJsonLd({
                name: `Articles tagged ${label}`,
                description: `Cryptocurrency news and analysis tagged "${label}".`,
                path: pageHref(base, page),
                items: posts.map((p) => ({
                  name: p.title,
                  path: `/news/${p.slug}`,
                })),
                startPosition: (page - 1) * POSTS_PER_PAGE + 1,
              }),
            ),
          }}
        />
      ) : null}

      <Breadcrumbs items={crumbs} />

      <div className="mb-4 flex items-center gap-4">
        <h1
          className="font-display text-2xl font-extrabold uppercase tracking-[0.2em] text-violet"
          style={{ textShadow: "0 0 16px var(--violet)" }}
        >
          <Diamond className="mr-1.5" />
          #{label}
        </h1>
        <span
          className="h-px flex-1"
          style={{
            background: "linear-gradient(to right, var(--violet), transparent)",
          }}
        />
      </div>

      <p className="mb-8 text-xs uppercase tracking-widest text-muted-foreground">
        {total > 0
          ? `${total} article${total === 1 ? "" : "s"}`
          : "No articles"}
        {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
      </p>

      {posts.length === 0 ? (
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          No articles carry this tag yet.
        </p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
          <Pagination
            basePath={base}
            page={page}
            totalPages={totalPages}
            accent="var(--violet)"
          />
        </>
      )}
    </div>
  );
}
