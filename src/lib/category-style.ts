import type { Category } from "@/types/post";

/** CSS color value (a palette var) used to accent each category. */
export const CATEGORY_COLOR: Record<Category, string> = {
  bitcoin: "var(--amber)",
  ethereum: "var(--violet)",
  altcoins: "var(--cyan)",
  defi: "var(--acid)",
  nft: "var(--magenta)",
  regulation: "var(--cyan)",
  market: "var(--amber)",
};
