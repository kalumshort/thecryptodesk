import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { SectionHeading } from "@/components/section-heading";
import { Sidebar } from "@/components/sidebar";
import { getLatestPosts, getPostsByCategory } from "@/lib/posts";
import { popularTags } from "@/lib/tags";
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
        posts: await getPostsByCategory(category, 3),
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

  const [lead, ...rest] = posts;
  const leadAccent = CATEGORY_COLOR[lead.category];
  const sections = categorySections.filter((s) => s.posts.length > 0);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
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
      <div className="min-w-0">
        {/* Lead story */}
        <section className="mb-12">
          <Link
            href={`/news/${lead.slug}`}
            className="group grid gap-6 overflow-hidden rounded-md panel md:min-h-[22rem] md:grid-cols-2"
            style={{ ["--accent" as string]: leadAccent }}
          >
            <div className="relative aspect-[16/9] overflow-hidden md:aspect-auto">
              <Image
                src={lead.coverImage || "/placeholder-cover.svg"}
                alt=""
                fill
                sizes="(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 380px"
                // The lead story image is the LCP element at every viewport and
                // is the only above-the-fold image, so preloading it is safe.
                preload
                className="object-cover opacity-85 transition-transform duration-700 group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-void/80 to-transparent" />
            </div>
            <div className="flex flex-col justify-center p-6 md:p-8">
              <p
                className="font-display text-xs font-bold uppercase tracking-[0.3em]"
                style={{ color: leadAccent, textShadow: `0 0 12px ${leadAccent}` }}
              >
                ◆ Top story // {CATEGORY_LABELS[lead.category]}
              </p>
              <h1 className="mt-3 font-display text-3xl font-extrabold leading-tight tracking-wide transition-colors group-hover:text-cyan sm:text-4xl">
                {lead.title}
              </h1>
              <p className="mt-4 leading-relaxed text-muted-foreground">
                {lead.excerpt}
              </p>
            </div>
          </Link>
        </section>

        {/* Latest news */}
        <SectionHeading label="Latest News" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>

        {/* Per-category sections */}
        {sections.map(({ category, posts: catPosts }) => (
          <section key={category} className="mt-14">
            <SectionHeading
              label={CATEGORY_LABELS[category]}
              accent={CATEGORY_COLOR[category]}
              href={`/category/${category}`}
            />
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {catPosts.map((post, i) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  variant={i === 0 ? "featured" : "default"}
                  className={i === 0 ? "sm:col-span-2" : undefined}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <Sidebar latest={posts} tags={popularTags(posts)} />
    </div>
  );
}
