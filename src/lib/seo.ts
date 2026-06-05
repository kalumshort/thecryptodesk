import type { Metadata } from "next";
import type { Post } from "@/types/post";

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
    keywords: post.keywords,
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
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: siteUrl(),
    },
    keywords: post.keywords.join(", "),
    articleSection: post.category,
  };
}
