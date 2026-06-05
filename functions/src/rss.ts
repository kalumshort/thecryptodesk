import Parser from "rss-parser";
import { createHash } from "node:crypto";
import type { Feed } from "./feeds";

// Extra fields some feeds use for images.
type CustomItem = {
  "media:content"?: { $?: { url?: string } };
  "media:thumbnail"?: { $?: { url?: string } };
};

const parser: Parser<unknown, CustomItem> = new Parser({
  timeout: 15000,
  headers: { "User-Agent": "TheCryptoDeskBot/1.0 (+https://thecryptodesk.example.com)" },
  customFields: {
    item: [
      ["media:content", "media:content"],
      ["media:thumbnail", "media:thumbnail"],
    ],
  },
});

export interface RawArticle {
  guidHash: string;
  title: string;
  link: string;
  summary: string;
  content: string;
  imageUrl: string;
  publishedAt: Date;
  feedName: string;
}

/** Stable hash of an item's unique id (guid or link) for dedup. */
function hashId(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractImage(item: Parser.Item & CustomItem): string {
  if (item.enclosure?.url) return item.enclosure.url;
  if (item["media:content"]?.$?.url) return item["media:content"].$.url;
  if (item["media:thumbnail"]?.$?.url) return item["media:thumbnail"].$.url;
  return "";
}

/** Fetch and normalise the items of a single feed. */
export async function fetchFeed(feed: Feed): Promise<RawArticle[]> {
  const parsed = await parser.parseURL(feed.url);
  return (parsed.items ?? []).map((item) => {
    const link = item.link ?? "";
    const guid = item.guid ?? link ?? item.title ?? "";
    const rawContent =
      // rss-parser exposes full content under these keys depending on the feed.
      (item as { "content:encoded"?: string })["content:encoded"] ??
      item.content ??
      item.contentSnippet ??
      "";
    return {
      guidHash: hashId(guid),
      title: (item.title ?? "").trim(),
      link,
      summary: stripHtml(item.contentSnippet ?? item.content ?? "").slice(0, 600),
      content: stripHtml(rawContent).slice(0, 6000),
      imageUrl: extractImage(item),
      publishedAt: item.isoDate ? new Date(item.isoDate) : new Date(),
      feedName: feed.name,
    };
  });
}
