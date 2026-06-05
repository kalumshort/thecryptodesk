import type { Metadata } from "next";
import { PostCard } from "@/components/post-card";
import { SectionHeading } from "@/components/section-heading";
import { getPostsByTag } from "@/lib/posts";
import { absoluteUrl } from "@/lib/seo";

export const revalidate = 300;
// Tags are open-ended, so render on demand rather than pre-building a fixed set.
export const dynamicParams = true;

type Params = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  const label = decodeURIComponent(tag);
  return {
    title: `#${label}`,
    description: `Cryptocurrency news tagged "${label}".`,
    alternates: { canonical: absoluteUrl(`/tag/${tag}`) },
  };
}

export default async function TagPage({ params }: Params) {
  const { tag } = await params;
  const label = decodeURIComponent(tag);
  const posts = await getPostsByTag(label, 36);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <SectionHeading label={`#${label}`} accent="var(--violet)" />
      {posts.length === 0 ? (
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          No transmissions carry this signal yet.
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
