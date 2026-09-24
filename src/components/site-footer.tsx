import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS } from "@/types/post";
import { SITE_NAME } from "@/lib/seo";
import { SiteLogo } from "@/components/site-logo";

/**
 * Standing links are separated from category links so the trust pages (about,
 * editorial policy, privacy, terms, contact) are reachable from every page.
 * The AI-disclosure sentence that used to live here now has a page of its own
 * at /editorial-policy, linked below.
 */
const STANDING_LINKS = [
  { href: "/about", label: "About" },
  { href: "/editorial-policy", label: "Editorial Policy" },
  { href: "/contact", label: "Contact" },
  { href: "/privacy", label: "Privacy" },
  { href: "/terms", label: "Terms" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 panel border-x-0 border-b-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-xs text-muted-foreground">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex max-w-md flex-col gap-3">
            <SiteLogo markSize={22} />
            <p className="leading-relaxed">
              Cryptocurrency news, live prices and plain-English explainers.
              Not financial advice.
            </p>
          </div>
          <nav
            aria-label="Browse categories"
            className="flex flex-wrap gap-x-4 gap-y-2 font-bold uppercase tracking-widest"
          >
            {CATEGORIES.map((cat) => (
              <Link
                key={cat}
                href={`/category/${cat}`}
                className="transition-colors hover:text-violet"
              >
                {CATEGORY_LABELS[cat]}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-3 border-t border-cyan/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <nav
            aria-label="About this site"
            className="flex flex-wrap gap-x-4 gap-y-2 uppercase tracking-widest"
          >
            {STANDING_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors hover:text-cyan"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <p>&copy; {new Date().getFullYear()} {SITE_NAME}</p>
        </div>
      </div>
    </footer>
  );
}
