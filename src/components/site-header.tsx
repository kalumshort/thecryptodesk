import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS } from "@/types/post";
import { SITE_NAME } from "@/lib/seo";

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
        <nav className="flex flex-1 items-center gap-1 overflow-x-auto text-xs">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat}
              href={`/category/${cat}`}
              className="rounded-sm px-3 py-1.5 font-bold uppercase tracking-widest text-muted-foreground transition-all hover:text-acid hover:[text-shadow:0_0_10px_var(--acid)]"
            >
              {CATEGORY_LABELS[cat]}
            </Link>
          ))}
          <span aria-hidden className="mx-1 h-4 w-px shrink-0 bg-cyan/20" />
          <Link
            href="/market"
            className="rounded-sm px-3 py-1.5 font-bold uppercase tracking-widest text-muted-foreground transition-all hover:text-cyan hover:[text-shadow:0_0_10px_var(--cyan)]"
          >
            Markets
          </Link>
          <Link
            href="/learn"
            className="rounded-sm px-3 py-1.5 font-bold uppercase tracking-widest text-muted-foreground transition-all hover:text-acid hover:[text-shadow:0_0_10px_var(--acid)]"
          >
            Learn
          </Link>
          <Link
            href="/glossary"
            className="rounded-sm px-3 py-1.5 font-bold uppercase tracking-widest text-muted-foreground transition-all hover:text-amber hover:[text-shadow:0_0_10px_var(--amber)]"
          >
            Glossary
          </Link>
          <Link
            href="/archive"
            className="rounded-sm px-3 py-1.5 font-bold uppercase tracking-widest text-muted-foreground transition-all hover:text-violet hover:[text-shadow:0_0_10px_var(--violet)]"
          >
            Archive
          </Link>
        </nav>
      </div>
      <span className="sr-only">{SITE_NAME}</span>
    </header>
  );
}
