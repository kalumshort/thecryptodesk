import Link from "next/link";
import { PostCard } from "@/components/post-card";
import { SectionHeading } from "@/components/section-heading";
import { Sidebar } from "@/components/sidebar";
import { getLatestPosts, getPostsByCategory } from "@/lib/posts";
import { popularTags } from "@/lib/tags";
import { CATEGORIES, CATEGORY_LABELS } from "@/types/post";
import { CATEGORY_COLOR } from "@/lib/category-style";

// Revalidate the homepage every 5 minutes so newly ingested posts appear
// without a redeploy, while still serving cached SSR HTML to crawlers.
export const revalidate = 300;

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
          No signal
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          The mesh is empty. Run the ingest function to synthesise posts.
        </p>
      </div>
    );
  }

  const [lead, ...rest] = posts;
  const leadAccent = CATEGORY_COLOR[lead.category];
  const sections = categorySections.filter((s) => s.posts.length > 0);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_320px]">
      <div className="min-w-0">
        {/* Lead story */}
        <section className="mb-12">
          <Link
            href={`/news/${lead.slug}`}
            className="group grid gap-6 overflow-hidden rounded-md panel md:min-h-[22rem] md:grid-cols-2"
            style={{ ["--accent" as string]: leadAccent }}
          >
            <div className="relative overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={lead.coverImage || "/placeholder-cover.svg"}
                alt={lead.title}
                className="aspect-[16/9] h-full w-full object-cover opacity-85 transition-transform duration-700 group-hover:scale-105 md:aspect-auto"
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
