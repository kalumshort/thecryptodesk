import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS } from "@/types/post";
import { SITE_NAME } from "@/lib/seo";
import { MobileNav } from "@/components/mobile-nav";
import { SiteLogo } from "@/components/site-logo";

export type NavLink = {
  href: string;
  label: string;
};

// Single source of truth for the nav, shared by the desktop row and the mobile
// drawer so the two never drift apart.
const NAV_LINKS: NavLink[] = [
  ...CATEGORIES.map((cat): NavLink => ({
    href: `/category/${cat}`,
    // The "market" category is news; "Market News" distinguishes it from the
    // live-prices page below (both previously read "Markets").
    label: cat === "market" ? "Market News" : CATEGORY_LABELS[cat],
  })),
  { href: "/market", label: "Live Prices" },
  { href: "/learn", label: "Learn" },
  { href: "/glossary", label: "Glossary" },
  { href: "/archive", label: "Archive" },
];

/**
 * One hover treatment for every item, shared with the mobile drawer.
 *
 * Each link used to glow in its own colour, which made the nav a row of five
 * competing hues — and put the "up" green on every category link, where it
 * read as a market signal rather than a topic.
 */
export const NAV_LINK_CLASS =
  "rounded-sm text-muted-foreground transition-colors hover:text-foreground";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full panel border-x-0 border-t-0">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link href="/" className="shrink-0" aria-label={`${SITE_NAME} home`}>
          <SiteLogo />
        </Link>
        <nav className="hidden flex-1 items-center gap-0.5 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`${NAV_LINK_CLASS} whitespace-nowrap px-2.5 py-2 text-[13px] font-medium`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <MobileNav links={NAV_LINKS} />
        </div>
      </div>
    </header>
  );
}
