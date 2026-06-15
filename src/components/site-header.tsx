import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS } from "@/types/post";
import { SITE_NAME } from "@/lib/seo";
import { MobileNav } from "@/components/mobile-nav";

export type NavLink = {
  href: string;
  label: string;
  accent: "acid" | "cyan" | "amber" | "violet";
};

// Single source of truth for the nav, shared by the desktop row and the mobile
// drawer so the two never drift apart.
const NAV_LINKS: NavLink[] = [
  ...CATEGORIES.map((cat): NavLink => ({
    href: `/category/${cat}`,
    label: CATEGORY_LABELS[cat],
    accent: "acid",
  })),
  { href: "/market", label: "Markets", accent: "cyan" },
  { href: "/learn", label: "Learn", accent: "acid" },
  { href: "/glossary", label: "Glossary", accent: "amber" },
  { href: "/archive", label: "Archive", accent: "violet" },
];

const ACCENT_HOVER: Record<NavLink["accent"], string> = {
  acid: "hover:text-acid hover:[text-shadow:0_0_10px_var(--acid)]",
  cyan: "hover:text-cyan hover:[text-shadow:0_0_10px_var(--cyan)]",
  amber: "hover:text-amber hover:[text-shadow:0_0_10px_var(--amber)]",
  violet: "hover:text-violet hover:[text-shadow:0_0_10px_var(--violet)]",
};

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 w-full panel border-x-0 border-t-0">
      <div className="mx-auto flex max-w-6xl items-center gap-6 px-4 py-3">
        <Link
          href="/"
          className="shrink-0 font-display text-lg font-bold uppercase tracking-[0.18em]"
        >
          <span className="text-cyan text-glow-cyan">The</span>
          <span className="text-foreground">CryptoDesk</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-1 text-xs md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-sm px-3 py-1.5 font-bold uppercase tracking-widest text-muted-foreground transition-all ${ACCENT_HOVER[link.accent]}`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto">
          <MobileNav links={NAV_LINKS} />
        </div>
      </div>
      <span className="sr-only">{SITE_NAME}</span>
    </header>
  );
}
