import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import { GUIDE_TOPICS, type GuideTopic } from "./guideTopics";
import { writeGuide, GEMINI_MODEL } from "./writeGuide";
import { generateCoverImage } from "./generateImage";

function slugify(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}

function readingTime(markdown: string): number {
  const words = markdown.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 200));
}

/** Per-level sequence number from the topic's position within its level. */
function orderWithinLevel(topic: GuideTopic, index: number): number {
  let order = 0;
  for (let i = 0; i < index; i++) {
    if (GUIDE_TOPICS[i].level === topic.level) order += 1;
  }
  return order;
}

export interface GuidesResult {
  created: number;
  skipped: number;
  errors: number;
}

/**
 * Generate any Learn-hub guides that don't exist yet, from GUIDE_TOPICS.
 * Idempotent: a topic whose slug already exists in `guides/` is skipped, so
 * re-running only fills in newly added topics.
 */
export async function generateGuides(): Promise<GuidesResult> {
  const db = getFirestore();
  const result: GuidesResult = { created: 0, skipped: 0, errors: 0 };

  for (let i = 0; i < GUIDE_TOPICS.length; i++) {
    const topic = GUIDE_TOPICS[i];
    const slug = slugify(topic.title);

    try {
      const ref = db.collection("guides").doc(slug);
      if ((await ref.get()).exists) {
        result.skipped += 1;
        continue;
      }

      const written = await writeGuide(topic);

      // Reuse the news cover-image pipeline (stored under posts/<slug>.png).
      const coverImage = await generateCoverImage(
        written.imagePrompt,
        topic.title,
        slug,
      );

      const now = FieldValue.serverTimestamp();
      await ref.set({
        slug,
        title: topic.title,
        excerpt: written.excerpt,
        content: written.content,
        level: topic.level,
        topic: topic.topic,
        order: orderWithinLevel(topic, i),
        tags: written.tags,
        coverImage,
        status: "published",
        publishedAt: now,
        createdAt: now,
        updatedAt: now,
        readingTimeMinutes: readingTime(written.content),
        metaTitle: written.metaTitle,
        metaDescription: written.metaDescription,
        keywords: written.keywords,
        aiModel: GEMINI_MODEL,
      });

      result.created += 1;
      logger.info(`Created guide "${slug}" (${topic.level})`);
    } catch (err) {
      logger.error(`Failed to generate guide for "${topic.title}"`, err);
      result.errors += 1;
    }
  }

  logger.info("Guide generation complete", result);
  return result;
}
