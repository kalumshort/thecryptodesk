import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Diamond } from "@/components/diamond";
import { Pagination, pageHref } from "@/components/pagination";
import { GuideLinks } from "@/components/guide-links";
import {
  POSTS_PER_PAGE,
  getPostsByCategoryPage,
} from "@/lib/posts";
import {
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
  collectionPageJsonLd,
} from "@/lib/seo";
import {
  CATEGORY_INTROS,
  CATEGORY_LABELS,
  type Category,
} from "@/types/post";
import { CATEGORY_COLOR } from "@/lib/category-style";

/**
 * Shared body for `/category/[category]` and `/category/[category]/page/[page]`
 * so the two routes cannot drift apart. Page 1 is served from the bare path;
 * this component only varies the canonical, heading suffix and offsets.
 */

function basePath(category: Category) {
  return `/category/${category}`;
}

/** Metadata for either category route. */
export function categoryMetadata(
  category: Category,
  page: number,
): Metadata {
  const label = CATEGORY_LABELS[category];
  const suffix = page > 1 ? ` — Page ${page}` : "";
  return {
    title: `${label} News${suffix}`,
    description: CATEGORY_INTROS[category],
    // Self-referencing canonical: page 2+ is its own indexable URL, NOT a
    // duplicate of page 1 and NOT noindexed.
    alternates: { canonical: absoluteUrl(pageHref(basePath(category), page)) },
    openGraph: {
      type: "website",
      url: absoluteUrl(pageHref(basePath(category), page)),
      title: `${label} News${suffix}`,
      description: CATEGORY_INTROS[category],
      // Stated explicitly rather than inherited: a page that declares
      // `openGraph` only picks up a file-convention image from its OWN segment,
      // so `/category/x/page/2` would otherwise ship with no og:image at all.
      images: [
        {
          url: absoluteUrl(`/category/${category}/opengraph-image`),
          width: 1200,
          height: 630,
          alt: `${label} news on ${SITE_NAME}`,
        },
      ],
    },
  };
}

export async function CategoryListing({
  category,
  page,
}: {
  category: Category;
  page: number;
}) {
  const base = basePath(category);
  // Page 1 has a canonical home at the bare path; never serve it from /page/1.
  if (page < 2 && page !== 1) redirect(base);

  const { posts, totalPages, total } = await getPostsByCategoryPage(
    category,
    page,
  );

  // Past the last page there is nothing to show — 404 rather than serving an
  // endless run of empty, indexable pages.
  if (page > 1 && posts.length === 0) notFound();

  const label = CATEGORY_LABELS[category];
  const accent = CATEGORY_COLOR[category];
  const crumbs = [
    { name: "Home", path: "/" },
    { name: label, path: base },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            collectionPageJsonLd({
              name: `${label} News`,
              description: CATEGORY_INTROS[category],
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

      <Breadcrumbs items={crumbs} />

      <div className="mb-4 flex items-center gap-4">
        <h1
          className="font-display text-2xl font-extrabold uppercase tracking-[0.25em]"
          style={{ color: accent, textShadow: `0 0 16px ${accent}` }}
        >
          <Diamond className="mr-1.5" />
          {label}
        </h1>
        <span
          className="h-px flex-1"
          style={{
            background: `linear-gradient(to right, ${accent}, transparent)`,
          }}
        />
      </div>

      {/* Indexable prose. Shown only on page 1 — repeating it across every
          paginated page would make them near-duplicates of each other. */}
      {page === 1 ? (
        <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          {CATEGORY_INTROS[category]}
        </p>
      ) : (
        <p className="mb-8 text-xs uppercase tracking-widest text-muted-foreground">
          Page {page} of {totalPages}
          {total > 0 ? ` · ${total} articles` : ""}
        </p>
      )}

      {posts.length === 0 ? (
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          No articles in this category yet.
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
            accent={accent}
          />
        </>
      )}

      {/* Cross-link into the Learn hub — news and guides previously never
          linked to each other at all. */}
      {page === 1 ? <GuideLinks category={category} /> : null}
    </div>
  );
}
