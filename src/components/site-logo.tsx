import { SITE_NAME } from "@/lib/seo";

/**
 * The brand mark: a diamond split by a horizontal gap, solid above and
 * outlined below. The gap reads as the desk, and as the two directions a
 * market moves.
 *
 * At 24px and under the lower triangle fills solid at 45% instead of
 * stroking — a sub-pixel hairline breaks up on low-density screens. Pass
 * `solid` at those sizes. The same rule governs `src/app/icon.svg`.
 */
export function BrandMark({
  size = 28,
  solid = false,
  className,
}: {
  size?: number;
  /** Use the small-size treatment (<= 24px). */
  solid?: boolean;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <polygon points="50,6 90,46 10,46" fill="currentColor" />
      {solid ? (
        <polygon points="10,54 90,54 50,94" fill="currentColor" opacity="0.45" />
      ) : (
        <polygon
          points="10,54 90,54 50,94"
          fill="none"
          stroke="currentColor"
          strokeWidth="7"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

/**
 * The primary lockup: mark plus wordmark. The mark carries the accent so the
 * wordmark can stay neutral — colour belongs to one element, not both.
 */
export function SiteLogo({
  markSize = 28,
  className,
}: {
  markSize?: number;
  className?: string;
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <BrandMark size={markSize} className="shrink-0 text-cyan" />
      <span className="font-display text-[17px] leading-none tracking-[-0.028em]">
        <span className="font-medium text-muted-foreground">The</span>
        <span className="font-bold text-foreground">
          {SITE_NAME.replace(/^The/, "")}
        </span>
      </span>
    </span>
  );
}
