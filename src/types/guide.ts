// Learn-hub guides: evergreen, AI-generated tutorials for newcomers. Kept in a
// separate `guides/` Firestore collection so they never mix with the news
// `posts/` pipeline or its category queries.

export const LEVELS = ["beginner", "intermediate", "advanced"] as const;

export type Level = (typeof LEVELS)[number];

export const LEVEL_LABELS: Record<Level, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

/** Accent color per level (palette vars), used for headings and badges. */
export const LEVEL_COLOR: Record<Level, string> = {
  beginner: "var(--acid)",
  intermediate: "var(--cyan)",
  advanced: "var(--violet)",
};

export function isLevel(value: string): value is Level {
  return (LEVELS as readonly string[]).includes(value);
}

/** Sort rank for a level (beginner first). */
export const LEVEL_RANK: Record<Level, number> = {
  beginner: 0,
  intermediate: 1,
  advanced: 2,
};

/**
 * A learn-hub guide as consumed by the frontend. Mirrors `Post` but for
 * educational content, swapping the news taxonomy for a difficulty `level`,
 * a `topic`, and an `order` for sequencing within a level.
 */
export interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown
  level: Level;
  topic: string;
  order: number;
  tags: string[];
  coverImage: string;
  status: "published" | "draft";
  publishedAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  readingTimeMinutes: number;
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  aiModel: string;
}
