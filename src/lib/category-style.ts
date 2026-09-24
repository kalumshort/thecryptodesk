import type { Category } from "@/types/post";

/**
 * CSS color value (a palette var) used to accent each category.
 *
 * Drawn only from the brand hues — cyan, violet, amber. The green and red
 * tokens are reserved for market direction, so a category tinted with one
 * would read as "up" or "down" rather than as a topic.
 */
export const CATEGORY_COLOR: Record<Category, string> = {
  bitcoin: "var(--amber)",
  ethereum: "var(--violet)",
  altcoins: "var(--cyan)",
  defi: "var(--cyan)",
  nft: "var(--violet)",
  regulation: "var(--cyan)",
  market: "var(--amber)",
};
