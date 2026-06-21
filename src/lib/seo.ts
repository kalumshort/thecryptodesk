import type { Metadata } from "next";
import type { Post } from "@/types/post";
import { EDITORIAL, type Author } from "@/lib/authors";

export const SITE_NAME = "TheCryptoDesk";
export const SITE_DESCRIPTION =
  "Fast, original cryptocurrency news — Bitcoin, Ethereum, DeFi, NFTs, regulation and markets.";

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
  const images = post.coverImage ? [{ url: post.coverImage }] : undefined;

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
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: post.coverImage ? [post.coverImage] : undefined,
    },
  };
}

/**
 * schema.org Organization JSON-LD identifying the publisher site-wide.
 * Rendered once in the root layout so Google can attribute every page to a
 * single publisher (also referenced as `publisher` in `newsArticleJsonLd`).
 */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl(),
    description: SITE_DESCRIPTION,
  };
}

/** schema.org WebSite JSON-LD establishing site identity. */
export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl(),
    description: SITE_DESCRIPTION,
    publisher: { "@type": "Organization", name: SITE_NAME, url: siteUrl() },
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
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl(),
    },
    keywords: post.keywords.join(", "),
    articleSection: post.category,
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
