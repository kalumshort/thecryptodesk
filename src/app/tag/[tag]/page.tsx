import type { Metadata } from "next";
import { cache } from "react";
import { PostCard } from "@/components/post-card";
import { getPostsByTag } from "@/lib/posts";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 300;
// Tags are open-ended, so render on demand rather than pre-building a fixed set.
export const dynamicParams = true;

// Index a tag page only once it has enough articles to be a useful landing page;
// thinner ones are auto-generated near-duplicates and get noindex (still followed).
const THIN_TAG_THRESHOLD = 3;

type Params = { params: Promise<{ tag: string }> };

// Deduped so generateMetadata and the page share one Firestore read per request
// (the admin SDK isn't auto-memoized the way `fetch` is).
const getTagPosts = cache((label: string) => getPostsByTag(label, 36));

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  const label = decodeURIComponent(tag);
  const posts = await getTagPosts(label);
  return {
    title: `#${label}`,
    description: `Cryptocurrency news tagged "${label}".`,
    alternates: { canonical: absoluteUrl(`/tag/${tag}`) },
    robots:
      posts.length < THIN_TAG_THRESHOLD
        ? { index: false, follow: true }
        : undefined,
  };
}

export default async function TagPage({ params }: Params) {
  const { tag } = await params;
  const label = decodeURIComponent(tag);
  const posts = await getTagPosts(label);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        <h1
          className="font-display text-2xl font-extrabold uppercase tracking-[0.2em] text-violet"
          style={{ textShadow: "0 0 16px var(--violet)" }}
        >
          ◆ #{label}
        </h1>
        <span
          className="h-px flex-1"
          style={{
            background: "linear-gradient(to right, var(--violet), transparent)",
          }}
        />
      </div>
      {posts.length === 0 ? (
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          No articles carry this tag yet.
        </p>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}
