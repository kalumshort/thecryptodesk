import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/seo";

/**
 * `/api/*` is internal plumbing for the client-side market ticker — it returns
 * JSON that duplicates data already on `/market`, so crawling it wastes crawl
 * budget and can surface a raw JSON URL in search results.
 *
 * AI training crawlers (GPTBot, CCBot, ClaudeBot, Google-Extended, …) are
 * currently allowed by the wildcard rule. To opt out, add entries here with
 * `disallow: "/"` — note that blocking `Google-Extended` does NOT affect
 * Googlebot or normal Search ranking, but blocking `GPTBot` or `ClaudeBot`
 * removes the site from AI assistant citations, which is a real referral
 * source. Deliberate either way; just not accidental.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: "/api/" },
      // Called out explicitly so a future restrictive wildcard rule can never
      // accidentally lock out Search or Google News.
      { userAgent: "Googlebot", allow: "/", disallow: "/api/" },
      { userAgent: "Googlebot-News", allow: "/", disallow: "/api/" },
      { userAgent: "Bingbot", allow: "/", disallow: "/api/" },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: absoluteUrl("/"),
  };
}
