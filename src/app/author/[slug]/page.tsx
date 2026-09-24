import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostCard } from "@/components/post-card";
import { SectionHeading } from "@/components/section-heading";
import { BrandMark } from "@/components/site-logo";
import { getLatestPosts } from "@/lib/posts";
import { getAllAuthorSlugs, getAuthor } from "@/lib/authors";
import { absoluteUrl, authorJsonLd, defaultOgImages } from "@/lib/seo";

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
    description: author.bio.slice(0, 155),
    alternates: { canonical: absoluteUrl(author.url) },
    openGraph: {
      type: "profile",
      url: absoluteUrl(author.url),
      title: author.name,
      description: author.role,
      images: defaultOgImages(),
    },
  };
}

export default async function AuthorPage({ params }: Params) {
  const { slug } = await params;
  const author = getAuthor(slug);
  if (!author) notFound();

  // Posts carry no author field yet, so this is the site-wide latest feed, not
  // a filtered byline list. Headed honestly below rather than labelled in a way
  // that implies filtering that isn't happening.
  const posts = await getLatestPosts(12);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(authorJsonLd(author)),
        }}
      />

      <header className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
        {/* Geometric monogram badge — an honest mark for an editorial entity
            rather than a fabricated human portrait. */}
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full panel text-cyan">
          <BrandMark size={34} />
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
          {author.links.map((l) => {
            const className =
              "text-violet transition-all hover:[text-shadow:0_0_10px_var(--violet)]";
            // Site-relative links get client-side nav and stay in the tab;
            // only genuinely external profiles open in a new one.
            return l.href.startsWith("/") ? (
              <Link key={l.href} href={l.href} className={className}>
                {l.label}
              </Link>
            ) : (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className={className}
              >
                {l.label}
              </a>
            );
          })}
        </div>
      ) : null}

      {posts.length > 0 ? (
        <section className="mt-12">
          <SectionHeading label="Latest from the desk" />
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
