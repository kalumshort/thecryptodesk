import type { Metadata } from "next";
import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { SectionHeading } from "@/components/section-heading";
import { HomeHero } from "@/components/home-hero";
import { MarketsBand } from "@/components/markets-band";
import { GuideStrip } from "@/components/guide-strip";
import { getLatestPosts, getPostsByCategory } from "@/lib/posts";
import { CATEGORIES, CATEGORY_LABELS } from "@/types/post";
import { CATEGORY_COLOR } from "@/lib/category-style";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  collectionPageJsonLd,
} from "@/lib/seo";

// Revalidate the homepage every 5 minutes so newly ingested posts appear
// without a redeploy, while still serving cached SSR HTML to crawlers.
export const revalidate = 300;

// The homepage is the site's highest-authority URL, so it gets an explicit
// title (not the layout's template default) and its own canonical.
export const metadata: Metadata = {
  // `absolute` opts out of the "%s · TheCryptoDesk" template, which would
  // otherwise double the brand name on the one page that least needs it.
  title: { absolute: `${SITE_NAME} — Cryptocurrency News, Prices & Analysis` },
  description: SITE_DESCRIPTION,
  alternates: { canonical: absoluteUrl("/") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Cryptocurrency News, Prices & Analysis`,
    description: SITE_DESCRIPTION,
  },
};

export default async function HomePage() {
  const [posts, categorySections] = await Promise.all([
    getLatestPosts(24),
    Promise.all(
      CATEGORIES.map(async (category) => ({
        category,
        posts: await getPostsByCategory(category, 5),
      })),
    ),
  ]);

  if (posts.length === 0) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-24 text-center">
        <h1 className="font-display text-2xl font-bold uppercase tracking-widest text-cyan text-glow-cyan">
          {SITE_NAME}
        </h1>
        {/* User-facing empty state: no internal tooling, no jargon. */}
        <p className="mt-3 text-sm text-muted-foreground">
          No articles have been published yet. Check back shortly.
        </p>
      </div>
    );
  }

  // Lead, the four headlines beside it, then the rest of the river.
  const [lead, ...others] = posts;
  const rail = others.slice(0, 4);
  const river = others.slice(4);
  const sections = categorySections.filter((s) => s.posts.length > 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Describes the homepage as the ordered list of stories it actually is. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            collectionPageJsonLd({
              name: `${SITE_NAME} — Cryptocurrency News`,
              description: SITE_DESCRIPTION,
              path: "/",
              items: posts.map((p) => ({
                name: p.title,
                path: `/news/${p.slug}`,
              })),
            }),
          ),
        }}
      />

      <HomeHero lead={lead} rail={rail} />

      <MarketsBand />

      {river.length > 0 ? (
        <>
          <SectionHeading label="Latest" href="/archive" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {river.map((post, i) => (
              <PostCard
                key={post.slug}
                post={post}
                // One wide card per row of six breaks the grid's monotony and
                // gives the eye somewhere to land.
                variant={i === 0 ? "featured" : "default"}
                className={i === 0 ? "sm:col-span-2" : undefined}
              />
            ))}
          </div>
        </>
      ) : null}

      {/* Per-category sections: a lead story beside a ranked list, rather than
          another row of identical cards. */}
      {sections.map(({ category, posts: catPosts }) => {
        const [catLead, ...catRest] = catPosts;
        const accent = CATEGORY_COLOR[category];
        return (
          <section key={category} className="mt-14">
            <SectionHeading
              label={CATEGORY_LABELS[category]}
              accent={accent}
              href={`/category/${category}`}
            />
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
              <PostCard post={catLead} variant="lead" />
              {catRest.length > 0 ? (
                <ol className="flex flex-col overflow-hidden rounded-md panel">
                  {catRest.map((post, i) => (
                    <li key={post.slug} className="flex-1">
                      <Link
                        href={`/news/${post.slug}`}
                        className="group flex h-full items-start gap-4 border-b border-border px-5 py-4 transition-colors hover:bg-cyan/5"
                      >
                        <span
                          aria-hidden
                          className="font-mono text-xl font-bold leading-none text-border"
                        >
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="font-display text-base font-semibold leading-snug text-foreground transition-colors group-hover:text-cyan">
                          {post.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ol>
              ) : null}
            </div>
          </section>
        );
      })}

      <GuideStrip />
    </div>
  );
}
