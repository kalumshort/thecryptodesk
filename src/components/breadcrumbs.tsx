import Link from "next/link";

/**
 * Accessible breadcrumb trail. `items` are ordered root → current page; the last
 * item renders as plain text (the current page). Feed it the SAME array passed to
 * `breadcrumbJsonLd` so the visible trail and the structured data stay in sync.
 */
export function Breadcrumbs({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  return (
    <nav
      aria-label="Breadcrumb"
      className="mb-5 text-[11px] uppercase tracking-widest text-muted-foreground"
    >
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.path} className="flex items-center gap-x-2">
              {isLast ? (
                <span
                  aria-current="page"
                  className="max-w-[60vw] truncate text-foreground/80"
                >
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="transition-colors hover:text-cyan"
                >
                  {item.name}
                </Link>
              )}
              {!isLast ? (
                <span aria-hidden className="text-cyan/40">
                  /
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
