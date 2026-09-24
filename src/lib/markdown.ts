/**
 * Markdown → plain text.
 *
 * The generation pipeline sometimes emits Markdown emphasis inside fields that
 * are rendered as plain text — `excerpt` on cards, `metaDescription` in meta
 * tags — which shipped literal `**asterisks**` into card copy and SERP
 * snippets. Stripping at the data-access boundary fixes every consumer at once.
 */
export function stripMarkdown(md: string): string {
  return md
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/^\s*[-*+]\s+/gm, "")
    .replace(/^\s*\d+\.\s+/gm, "")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/(\*\*|__)/g, "")
    // Single `*`/`_` only when they wrap text, so "gas_limit" survives.
    .replace(/(?<![\w*])[*_](?=\S)([^*_]+?)(?<=\S)[*_](?![\w*])/g, "$1")
    .replace(/^>\s?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
