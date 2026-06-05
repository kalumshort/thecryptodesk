import Link from "next/link";
import { CATEGORIES, CATEGORY_LABELS } from "@/types/post";
import { SITE_NAME } from "@/lib/seo";

export function SiteFooter() {
  return (
    <footer className="mt-16 panel border-x-0 border-b-0">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-md leading-relaxed">
          <span className="font-display uppercase tracking-widest text-cyan">
            {SITE_NAME}
          </span>{" "}
          // © {new Date().getFullYear()} — news summaries are AI-synthesised;
          always verify against the original source.
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-2 font-bold uppercase tracking-widest">
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
    </footer>
  );
}
