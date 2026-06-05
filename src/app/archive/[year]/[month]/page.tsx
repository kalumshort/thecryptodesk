import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { getArchiveIndex, getPostsByMonth } from "@/lib/posts";
import { absoluteUrl } from "@/lib/seo";
import { formatMonth } from "@/lib/format";

export const revalidate = 3600;
export const dynamicParams = true;

type Params = { params: Promise<{ year: string; month: string }> };

export async function generateStaticParams() {
  const entries = await getArchiveIndex();
  return entries.map((e) => ({
    year: String(e.year),
    month: String(e.month).padStart(2, "0"),
  }));
}

function parse(year: string, month: string) {
  const y = Number(year);
  const m = Number(month);
  if (!Number.isInteger(y) || !Number.isInteger(m) || m < 1 || m > 12) {
    return null;
  }
  return { y, m };
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { year, month } = await params;
  const parsed = parse(year, month);
  if (!parsed) return { title: "Not found" };
  const label = formatMonth(parsed.y, parsed.m);
  return {
    title: `Archive — ${label}`,
    description: `Cryptocurrency news from ${label}.`,
    alternates: {
      canonical: absoluteUrl(
        `/archive/${parsed.y}/${String(parsed.m).padStart(2, "0")}`,
      ),
    },
  };
}

export default async function ArchiveMonthPage({ params }: Params) {
  const { year, month } = await params;
  const parsed = parse(year, month);
  if (!parsed) notFound();

  const posts = await getPostsByMonth(parsed.y, parsed.m);
  const label = formatMonth(parsed.y, parsed.m);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-8 flex flex-wrap items-center gap-4">
        <Link
          href="/archive"
          className="font-display text-xs font-bold uppercase tracking-widest text-muted-foreground hover:text-cyan"
        >
          ◆ Archive
        </Link>
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-[0.2em] text-cyan text-glow-cyan">
          {label}
        </h1>
        <span className="h-px flex-1 bg-gradient-to-r from-cyan/60 to-transparent" />
      </div>

      {posts.length === 0 ? (
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          No transmissions archived for this month.
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
