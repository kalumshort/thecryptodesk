/**
 * Content authors / editorial entities. Surfaced as a byline, an `/author`
 * profile page, and JSON-LD `author` for E-E-A-T. This models an honest
 * editorial desk — not a fabricated human persona. Per-post author attribution
 * can be added later by storing an author slug on each post; for now every post
 * is by the editorial desk.
 *
 * `bio` is also emitted verbatim inside the ProfilePage JSON-LD via
 * `authorJsonLd`, so edits here change structured data too. Details of how
 * articles are produced live on /editorial-policy rather than in this blurb.
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
    "The TheCryptoDesk editorial desk condenses cryptocurrency news from " +
    "established industry publications into clear, factual reports. Every " +
    "article preserves the source's specific figures, names and dates, adds " +
    "plain-language context on why it matters, and links back to the original " +
    "reporting so readers can check it for themselves. Facts are treated as " +
    "non-negotiable: figures are never rounded away, named entities are never " +
    "generalised, and nothing is invented.",
  url: "/author/editorial",
  links: [
    { label: "Editorial policy", href: "/editorial-policy" },
    { label: "Contact", href: "/contact" },
  ],
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
