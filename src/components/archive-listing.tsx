import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { Pagination, pageHref } from "@/components/pagination";
import { POSTS_PER_PAGE, getPostsByMonthPage } from "@/lib/posts";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  collectionPageJsonLd,
  defaultOgImages,
} from "@/lib/seo";
import { formatMonth } from "@/lib/format";

/** Shared body for `/archive/[year]/[month]` and its `/page/[page]` variant. */

/** Validate a year/month pair from the URL. */
export function parseMonth(year: string, month: string) {
  if (!/^\d{4}$/.test(year) || !/^\d{1,2}$/.test(month)) return null;
  const y = Number(year);
  const m = Number(month);
  if (m < 1 || m > 12) return null;
  return { y, m };
}

export function monthPath(y: number, m: number) {
  return `/archive/${y}/${String(m).padStart(2, "0")}`;
}

export function archiveMetadata(y: number, m: number, page: number): Metadata {
  const label = formatMonth(y, m);
  const suffix = page > 1 ? ` — Page ${page}` : "";
  const description = `Every cryptocurrency news article published on TheCryptoDesk in ${label}.`;
  return {
    title: `Archive — ${label}${suffix}`,
    description,
    alternates: { canonical: absoluteUrl(pageHref(monthPath(y, m), page)) },
    openGraph: {
      type: "website",
      url: absoluteUrl(pageHref(monthPath(y, m), page)),
      title: `Archive — ${label}${suffix}`,
      description,
      images: defaultOgImages(),
    },
  };
}

export async function ArchiveListing({
  y,
  m,
  page,
}: {
  y: number;
  m: number;
  page: number;
}) {
  const base = monthPath(y, m);
  const { posts, totalPages, total } = await getPostsByMonthPage(y, m, page);

  if (page > 1 && posts.length === 0) notFound();

  const label = formatMonth(y, m);
  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Archive", path: "/archive" },
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
      {posts.length > 0 ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(
              collectionPageJsonLd({
                name: `Archive — ${label}`,
                description: `Cryptocurrency news published in ${label}.`,
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

      <div className="mb-4 flex flex-wrap items-center gap-4">
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-[0.2em] text-cyan text-glow-cyan">
          {label}
        </h1>
        <span className="h-px flex-1 bg-gradient-to-r from-cyan/60 to-transparent" />
      </div>

      <p className="mb-8 text-xs uppercase tracking-widest text-muted-foreground">
        {total > 0
          ? `${total} article${total === 1 ? "" : "s"}`
          : "No articles"}
        {totalPages > 1 ? ` · Page ${page} of ${totalPages}` : ""}
      </p>

      {posts.length === 0 ? (
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          No articles were published in this month.
        </p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
          <Pagination basePath={base} page={page} totalPages={totalPages} />
        </>
      )}
    </div>
  );
}
