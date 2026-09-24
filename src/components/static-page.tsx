import type { ReactNode } from "react";
import { Diamond } from "@/components/diamond";

/**
 * Scaffold for the site's hand-written standing pages (about, editorial policy,
 * privacy, terms, contact). Narrower than the article column because these are
 * read top-to-bottom rather than scanned.
 */
export function StaticPage({
  title,
  intro,
  updated,
  accent = "var(--cyan)",
  children,
}: {
  title: string;
  intro?: string;
  /** ISO date; rendered as a "last updated" line for the legal pages. */
  updated?: string;
  accent?: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-3 flex items-center gap-4">
        <h1
          className="font-display text-2xl font-extrabold uppercase tracking-[0.25em]"
          style={{ color: accent, textShadow: `0 0 16px ${accent}` }}
        >
          <Diamond className="mr-1.5" />
          {title}
        </h1>
        <span
          className="h-px flex-1"
          style={{
            background: `linear-gradient(to right, ${accent}, transparent)`,
          }}
        />
      </div>

      {intro ? (
        <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
          {intro}
        </p>
      ) : null}

      {updated ? (
        <p className="mb-8 text-xs uppercase tracking-widest text-muted-foreground">
          Last updated{" "}
          <time dateTime={updated}>
            {new Date(updated).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            })}
          </time>
        </p>
      ) : null}

      {children}
    </div>
  );
}
