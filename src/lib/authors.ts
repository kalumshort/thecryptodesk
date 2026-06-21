/**
 * Content authors / editorial entities. Surfaced as a byline, an `/author`
 * profile page, and JSON-LD `author` for E-E-A-T. The site openly discloses AI
 * synthesis, so this models an honest editorial desk — not a fabricated human
 * persona. Per-post author attribution can be added later by storing an author
 * slug on each post; for now every post is by the editorial desk.
 */
export interface Author {
  slug: string;
  name: string;
  /** One-line role / credential shown under the name. */
  role: string;
  /** Short bio for the profile page. */
  bio: string;
  /** Public profile path on this site (site-relative). */
  url: string;
  /** Optional external links (social, RSS, etc.). */
  links?: { label: string; href: string }[];
}

export const EDITORIAL: Author = {
  slug: "editorial",
  name: "TheCryptoDesk Editorial",
  role: "Editorial Desk · Cryptocurrency News",
  bio:
    "The TheCryptoDesk editorial desk curates and synthesises cryptocurrency " +
    "news from established industry sources into clear, factual reports. Every " +
    "article preserves the source's specific figures, names, and dates, adds " +
    "plain-language context on why it matters, and links back to the original " +
    "reporting. Articles are drafted with AI assistance under editorial " +
    "guidelines that treat facts as non-negotiable.",
  url: "/author/editorial",
};

const AUTHORS: Record<string, Author> = {
  [EDITORIAL.slug]: EDITORIAL,
};

/** Look up an author by slug, or `undefined`. */
export function getAuthor(slug: string): Author | undefined {
  return AUTHORS[slug];
}

/** Every author slug — for static params / sitemap. */
export function getAllAuthorSlugs(): string[] {
  return Object.keys(AUTHORS);
}
