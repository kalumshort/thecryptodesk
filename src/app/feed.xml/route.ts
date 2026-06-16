import { getLatestPosts } from "@/lib/posts";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  siteUrl,
} from "@/lib/seo";

// Match the homepage/sitemap cadence: refresh the feed in the background
// every 5 minutes so aggregators and crawlers pick up new posts quickly.
export const revalidate = 300;

const XML_ENTITIES: Record<string, string> = {
  "<": "&lt;",
  ">": "&gt;",
  "&": "&amp;",
  "'": "&apos;",
  '"': "&quot;",
};

function escapeXml(value: string): string {
  return value.replace(/[<>&'"]/g, (c) => XML_ENTITIES[c]);
}

export async function GET() {
  const posts = await getLatestPosts(30);

  const items = posts
    .map((post) => {
      const url = absoluteUrl(`/news/${post.slug}`);
      return `    <item>
      <title>${escapeXml(post.metaTitle || post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
      <category>${escapeXml(post.category)}</category>
      <description>${escapeXml(post.metaDescription || post.excerpt)}</description>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_NAME)} — Cryptocurrency News</title>
    <link>${siteUrl()}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${absoluteUrl("/feed.xml")}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
