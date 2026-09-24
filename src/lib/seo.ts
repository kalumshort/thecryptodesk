import type { Metadata } from "next";
import type { Post } from "@/types/post";
import { EDITORIAL, type Author } from "@/lib/authors";

export const SITE_NAME = "TheCryptoDesk";
export const SITE_DESCRIPTION =
  "Fast, original cryptocurrency news — Bitcoin, Ethereum, DeFi, NFTs, regulation and markets.";

// Published on /contact, /privacy, /terms and the editorial policy. Keep it
// pointed at a mailbox that is actually monitored — a contact route that goes
// nowhere is worse for trust than none at all.
export const CONTACT_EMAIL = "kalum@11votes.com";

// Fail loudly at module load rather than silently shipping localhost canonicals
// across the entire site — a misconfigured deploy would otherwise de-index us.
if (process.env.NODE_ENV === "production" && !process.env.NEXT_PUBLIC_SITE_URL) {
  throw new Error(
    "NEXT_PUBLIC_SITE_URL is required in production — canonical URLs, the " +
      "sitemap and robots.txt all derive from it. Set it in apphosting.yaml.",
  );
}

/**
 * The site-wide generated OG card (`src/app/opengraph-image.tsx`).
 *
 * Declaring an `openGraph` object on a page REPLACES the inherited one, which
 * drops the image the root `opengraph-image` file convention would otherwise
 * contribute — a page only auto-inherits a file-convention image from its own
 * segment. So any page that sets `openGraph` must pass images explicitly, and
 * this is the default to use.
 */
export function defaultOgImages() {
  return [
    {
      url: absoluteUrl("/opengraph-image"),
      width: 1200,
      height: 630,
      alt: `${SITE_NAME} — Cryptocurrency News`,
    },
  ];
}

/** Absolute site origin, no trailing slash. */
export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function absoluteUrl(path: string): string {
  return `${siteUrl()}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Per-post <head> metadata: title, description, canonical, OG, Twitter. */
export function buildPostMetadata(post: Post): Metadata {
  const url = absoluteUrl(`/news/${post.slug}`);
  const title = post.metaTitle || post.title;
  const description = post.metaDescription || post.excerpt;

  // Articles keep their own cover image rather than a generated card — a real
  // illustration outperforms a text card, and rasterising one per slug at
  // request time would not survive this backend. Posts with no cover fall back
  // to the site-wide generated card, which previously meant no og:image at all.
  const imageUrl = post.coverImage || absoluteUrl("/opengraph-image");
  const images = [
    { url: imageUrl, width: 1200, height: 630, alt: post.title },
  ];

  return {
    title,
    description,
    authors: [{ name: EDITORIAL.name, url: absoluteUrl(EDITORIAL.url) }],
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      siteName: SITE_NAME,
      images,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt,
      authors: [absoluteUrl(EDITORIAL.url)],
      section: post.category,
      tags: post.tags,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

/** Stable JSON-LD node id for the publisher, so other nodes can reference it. */
export function organizationId(): string {
  return `${siteUrl()}/#organization`;
}

/**
 * The publisher node, reused by every schema that needs one.
 *
 * `logo` is not optional in practice: Google requires it on the `publisher` of
 * an Article/NewsArticle, and omitting it fails Rich Results validation for the
 * whole article — which is what was happening before.
 */
export function publisherJsonLd() {
  return {
    "@type": "Organization",
    "@id": organizationId(),
    name: SITE_NAME,
    url: siteUrl(),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/logo.png"),
      width: 512,
      height: 512,
    },
  };
}

/**
 * schema.org Organization JSON-LD identifying the publisher site-wide.
 * Rendered once in the root layout so Google can attribute every page to a
 * single publisher (also referenced by `@id` from `newsArticleJsonLd`).
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    ...publisherJsonLd(),
    description: SITE_DESCRIPTION,
    // `sameAs` belongs here once real social profiles exist — listing accounts
    // we don't control would be worse than omitting the field.
  };
}

/** schema.org WebSite JSON-LD establishing site identity. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl()}/#website`,
    name: SITE_NAME,
    url: siteUrl(),
    description: SITE_DESCRIPTION,
    publisher: { "@id": organizationId() },
  };
}

/**
 * schema.org BreadcrumbList JSON-LD. `items` are ordered root → current page;
 * each `path` is site-relative and resolved to an absolute URL here.
 */
export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/** schema.org NewsArticle JSON-LD for a post page. */
export function newsArticleJsonLd(post: Post) {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: post.title,
    description: post.metaDescription || post.excerpt,
    image: post.coverImage ? [post.coverImage] : undefined,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": absoluteUrl(`/news/${post.slug}`),
    },
    author: {
      "@type": "Organization",
      name: EDITORIAL.name,
      url: absoluteUrl(EDITORIAL.url),
    },
    publisher: publisherJsonLd(),
    keywords: post.keywords.join(", "),
    articleSection: post.category,
  };
}

/**
 * schema.org CollectionPage + ItemList JSON-LD for a listing page (category,
 * tag, archive month, learn index).
 *
 * `position` is offset by the page number so a paginated listing describes one
 * continuous list rather than restarting at 1 on every page.
 */
export function collectionPageJsonLd({
  name,
  description,
  path,
  items,
  startPosition = 1,
}: {
  name: string;
  description: string;
  /** Site-relative path of this listing page. */
  path: string;
  /** Ordered items, each with a site-relative path. */
  items: { name: string; path: string }[];
  startPosition?: number;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name,
    description,
    url: absoluteUrl(path),
    isPartOf: { "@id": `${siteUrl()}/#website` },
    publisher: { "@id": organizationId() },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: items.length,
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: startPosition + i,
        name: item.name,
        url: absoluteUrl(item.path),
      })),
    },
  };
}

/** schema.org ProfilePage JSON-LD for an author / editorial profile page. */
export function authorJsonLd(author: Author) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Organization",
      name: author.name,
      description: author.bio,
      url: absoluteUrl(author.url),
    },
  };
}
