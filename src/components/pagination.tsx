import Link from "next/link";

/**
 * Crawlable pagination for the listing routes.
 *
 * Every control is a real `<a href>` via `next/link` — never a button plus
 * `router.push`, which would make pages 2+ unreachable to a crawler. Page 1
 * lives at the bare path (`/category/bitcoin`) and pages 2+ under
 * `/page/N`, so page 1 keeps the canonical URL people actually link to.
 */

/** Build the href for a page number, given the listing's base path. */
export function pageHref(basePath: string, page: number): string {
  return page <= 1 ? basePath : `${basePath}/page/${page}`;
}

/**
 * Page numbers to render: always first and last, plus a window around the
 * current page, with `null` marking an elided run.
 */
function pageItems(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const items: (number | null)[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) items.push(null);
  for (let p = start; p <= end; p++) items.push(p);
  if (end < total - 1) items.push(null);
  items.push(total);

  return items;
}

const CELL =
  "flex h-9 min-w-9 items-center justify-center rounded-sm border px-3 text-xs font-bold uppercase tracking-widest transition-all";

export function Pagination({
  basePath,
  page,
  totalPages,
  accent = "var(--cyan)",
}: {
  /** Listing root, no trailing slash, e.g. `/category/bitcoin`. */
  basePath: string;
  page: number;
  totalPages: number;
  accent?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      className="mt-12 flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          href={pageHref(basePath, page - 1)}
          rel="prev"
          className={`${CELL} border-cyan/25 text-muted-foreground hover:border-cyan hover:text-cyan`}
        >
          Prev
        </Link>
      ) : null}

      {pageItems(page, totalPages).map((p, i) =>
        p === null ? (
          <span
            key={`gap-${i}`}
            aria-hidden
            className="px-1 text-xs text-muted-foreground"
          >
            …
          </span>
        ) : p === page ? (
          <span
            key={p}
            aria-current="page"
            className={`${CELL} border-transparent`}
            style={{
              color: accent,
              borderColor: accent,
              textShadow: `0 0 10px ${accent}`,
            }}
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={pageHref(basePath, p)}
            className={`${CELL} border-cyan/25 text-muted-foreground hover:border-cyan hover:text-cyan`}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link
          href={pageHref(basePath, page + 1)}
          rel="next"
          className={`${CELL} border-cyan/25 text-muted-foreground hover:border-cyan hover:text-cyan`}
        >
          Next
        </Link>
      ) : null}
    </nav>
  );
}
