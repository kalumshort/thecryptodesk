import Link from "next/link";

/**
 * The site's standard section heading: a `◆`-prefixed Orbitron label followed by
 * a fading hairline. Pass `accent` for a category-colored, glowing label and
 * `href` to make the label a link (e.g. category sections → their category page).
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

  const labelEl = href ? (
    <Link href={href} className={`${labelClass} transition-opacity hover:opacity-80`} style={style}>
      ◆ {label}
    </Link>
  ) : (
    <h2 className={labelClass} style={style}>
      ◆ {label}
    </h2>
  );

  return (
    <div className="mb-6 flex items-center gap-4">
      {labelEl}
      <span
        className="h-px flex-1"
        style={{
          background: `linear-gradient(to right, ${accent ?? "var(--cyan)"}, transparent)`,
        }}
      />
    </div>
  );
}
