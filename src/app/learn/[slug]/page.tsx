import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/post-body";
import { getAllGuideSlugs, getGuideBySlug, getGuidesByLevel } from "@/lib/guides";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  organizationId,
  SITE_NAME,
} from "@/lib/seo";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { extractFaq, faqPageJsonLd } from "@/lib/faq";
import { formatDate } from "@/lib/format";
import { LEVEL_COLOR, LEVEL_LABELS, type Guide } from "@/types/guide";
import { Diamond } from "@/components/diamond";

export const revalidate = 300;
export const dynamicParams = true;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllGuideSlugs();
  return slugs.map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: "Not found" };
  const title = guide.metaTitle || guide.title;
  const description = guide.metaDescription || guide.excerpt;
  const images = guide.coverImage ? [{ url: guide.coverImage }] : undefined;
  return {
    title,
    description,
    keywords: guide.keywords,
    alternates: { canonical: absoluteUrl(`/learn/${guide.slug}`) },
    openGraph: {
      type: "article",
      url: absoluteUrl(`/learn/${guide.slug}`),
      title,
      description,
      siteName: SITE_NAME,
      images,
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

function learningResourceJsonLd(guide: Guide) {
  return {
    "@context": "https://schema.org",
    "@type": "LearningResource",
    name: guide.title,
    description: guide.metaDescription || guide.excerpt,
    image: guide.coverImage ? [guide.coverImage] : undefined,
    educationalLevel: LEVEL_LABELS[guide.level],
    datePublished: guide.publishedAt,
    dateModified: guide.updatedAt,
    url: absoluteUrl(`/learn/${guide.slug}`),
    // Reference the site-wide Organization node so the publisher carries the
    // logo required for rich results, instead of a bare name.
    publisher: { "@id": organizationId() },
    author: { "@id": organizationId() },
    keywords: guide.keywords.join(", "),
  };
}

export default async function GuidePage({ params }: Params) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const accent = LEVEL_COLOR[guide.level];

  // Prev/next within the same level, by intended order.
  const siblings = await getGuidesByLevel(guide.level);
  const idx = siblings.findIndex((g) => g.slug === guide.slug);
  const prev = idx > 0 ? siblings[idx - 1] : null;
  const next = idx >= 0 && idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Learn", path: "/learn" },
    { name: guide.title, path: `/learn/${guide.slug}` },
  ];

  // Only emitted when the guide genuinely contains question-form sections.
  const faq = faqPageJsonLd(extractFaq(guide.content));

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs)),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(learningResourceJsonLd(guide)),
        }}
      />
      {faq ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faq) }}
        />
      ) : null}

      <Breadcrumbs items={crumbs} />

      <div className="mb-4 flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-widest">
        <Link
          href="/learn"
          className="font-display font-bold"
          style={{ color: accent, textShadow: `0 0 10px ${accent}` }}
        >
          <Diamond className="mr-1.5" />
          {LEVEL_LABELS[guide.level]}
        </Link>
        <span className="text-muted-foreground">
          {guide.readingTimeMinutes}m read
          {" // "}
          <time dateTime={guide.publishedAt}>
            {formatDate(guide.publishedAt)}
          </time>
        </span>
      </div>

      <h1 className="font-display text-3xl font-extrabold leading-tight tracking-wide text-foreground text-glow-cyan sm:text-4xl">
        {guide.title}
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
        {guide.excerpt}
      </p>

      {guide.coverImage ? (
        <Image
          src={guide.coverImage}
          // Not decorative — this is the guide's main illustration, and it was
          // previously shipping with an empty alt.
          alt={guide.title}
          width={1200}
          height={675}
          sizes="(max-width: 799px) 100vw, 736px"
          preload
          className="mt-8 aspect-[16/9] w-full rounded-md object-cover glow-border-cyan"
        />
      ) : null}

      <div className="my-8 h-px bg-gradient-to-r from-cyan/60 via-violet/30 to-transparent" />

      <PostBody content={guide.content} />

      <div className="my-8 h-px bg-gradient-to-r from-violet/60 to-transparent" />

      <footer className="text-xs leading-relaxed text-muted-foreground">
        <p>
          <Diamond className="mr-1.5" />
          Educational guide · always do your own research · not financial
          advice. How these are written:{" "}
          <Link
            href="/editorial-policy"
            className="text-foreground/80 transition-colors hover:text-cyan"
          >
            editorial policy
          </Link>
          .
        </p>
        {guide.tags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {guide.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-sm border border-violet/40 px-2 py-1 uppercase tracking-widest text-violet"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </footer>

      {prev || next ? (
        <nav className="mt-12 grid gap-4 border-t border-cyan/15 pt-6 sm:grid-cols-2">
          {prev ? (
            <Link
              href={`/learn/${prev.slug}`}
              className="group rounded-md panel p-4 transition-all hover:-translate-y-0.5"
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                ← Previous
              </div>
              <div className="mt-1 font-display text-sm font-bold text-foreground transition-colors group-hover:text-cyan">
                {prev.title}
              </div>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link
              href={`/learn/${next.slug}`}
              className="group rounded-md panel p-4 text-right transition-all hover:-translate-y-0.5"
            >
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
                Next →
              </div>
              <div className="mt-1 font-display text-sm font-bold text-foreground transition-colors group-hover:text-cyan">
                {next.title}
              </div>
            </Link>
          ) : (
            <span />
          )}
        </nav>
      ) : null}
    </article>
  );
}
