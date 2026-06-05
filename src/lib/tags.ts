import type { Post } from "@/types/post";

/**
 * The most frequent tags across the given posts, most common first.
 * Pure helper used to populate the sidebar's "Popular tags" cloud.
 */
export function popularTags(posts: Post[], limit = 12): string[] {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([tag]) => tag);
}
