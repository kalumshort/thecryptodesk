import Link from "next/link";
import { Diamond } from "@/components/diamond";

/**
 * The site's standard section heading: a `◆`-prefixed display-face label followed by
 * a fading hairline. Pass `accent` for a category-colored, glowing label and
 * `href` to make the label a link (e.g. category sections → their category page).
 *
 * The `<h2>` is always rendered — when `href` is set the link goes *inside* the
 * heading. Previously the linked variant emitted a bare `<Link>`, so the
 * homepage's per-category sections had no heading in the document outline at all.
 */
export function SectionHeading({
  label,
  accent,
  href,
}: {
  label: string;
  accent?: string;
  href?: string;
}) {
  const labelClass =
    "font-display text-sm font-bold uppercase tracking-[0.3em] whitespace-nowrap";
  const style = accent
    ? { color: accent, textShadow: `0 0 12px ${accent}` }
    : undefined;

  return (
    <div className="mb-6 flex items-center gap-4">
      <h2 className={labelClass} style={style}>
        <Diamond className="mr-1.5" />
        {href ? (
          <Link href={href} className="transition-opacity hover:opacity-80">
            {label}
          </Link>
        ) : (
          label
        )}
      </h2>
      <span
        className="h-px flex-1"
        style={{
          background: `linear-gradient(to right, ${accent ?? "var(--cyan)"}, transparent)`,
        }}
      />
    </div>
  );
}
