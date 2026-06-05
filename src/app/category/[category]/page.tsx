import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { getPostsByCategory } from "@/lib/posts";
import { absoluteUrl } from "@/lib/seo";
import { CATEGORIES, CATEGORY_LABELS, isCategory } from "@/types/post";
import { CATEGORY_COLOR } from "@/lib/category-style";

export const revalidate = 300;

type Params = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  if (!isCategory(category)) return { title: "Not found" };
  const label = CATEGORY_LABELS[category];
  const title = `${label} News`;
  return {
    title,
    description: `The latest ${label} cryptocurrency news and analysis.`,
    alternates: { canonical: absoluteUrl(`/category/${category}`) },
  };
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params;
  if (!isCategory(category)) notFound();

  const posts = await getPostsByCategory(category, 36);
  const label = CATEGORY_LABELS[category];
  const accent = CATEGORY_COLOR[category];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex items-center gap-4">
        <h1
          className="font-display text-2xl font-extrabold uppercase tracking-[0.25em]"
          style={{ color: accent, textShadow: `0 0 16px ${accent}` }}
        >
          ◆ {label}
        </h1>
        <span
          className="h-px flex-1"
          style={{
            background: `linear-gradient(to right, ${accent}, transparent)`,
          }}
        />
      </div>
      {posts.length === 0 ? (
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          No transmissions in this sector yet.
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
