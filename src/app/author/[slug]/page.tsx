import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { SectionHeading } from "@/components/section-heading";
import { getLatestPosts } from "@/lib/posts";
import { getAllAuthorSlugs, getAuthor } from "@/lib/authors";
import { absoluteUrl, authorJsonLd } from "@/lib/seo";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllAuthorSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) return { title: "Not found" };
  return {
    title: author.name,
    description: author.role,
    alternates: { canonical: absoluteUrl(author.url) },
  };
}

export default async function AuthorPage({ params }: Params) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();

  const posts = await getLatestPosts(12);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* eslint-disable-next-line react/no-danger */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(authorJsonLd(author)),
        }}
      />

      <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        {/* Geometric monogram badge — an honest mark for an editorial entity
            rather than a fabricated human portrait. */}
        <div
          aria-hidden
          className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full panel font-display text-2xl font-bold text-cyan text-glow-cyan"
        >
          ◆
        </div>
        <div>
          <h1 className="font-display text-2xl font-extrabold tracking-wide text-foreground text-glow-cyan sm:text-3xl">
            {author.name}
          </h1>
          <p className="mt-1 text-xs uppercase tracking-widest text-cyan">
            {author.role}
          </p>
        </div>
      </header>

      <p className="mt-6 leading-relaxed text-foreground/90">{author.bio}</p>

      {author.links && author.links.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-3 text-xs uppercase tracking-widest">
          {author.links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet transition-all hover:[text-shadow:0_0_10px_var(--violet)]"
            >
              {l.label}
            </a>
          ))}
        </div>
      ) : null}

      {posts.length > 0 ? (
        <section className="mt-12">
          <SectionHeading label="Recent articles" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
