/**
 * The site's `◆` motif as a decorative mark.
 *
 * Always `aria-hidden`: when this glyph sits inside a heading's text node the
 * accessible name — and the text Google indexes — becomes literally "◆ Bitcoin"
 * instead of "Bitcoin". Rendering it as a hidden sibling keeps the visual
 * without polluting the heading.
 */
export function Diamond({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" className={className}>
      ◆
    </span>
  );
}
