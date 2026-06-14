import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";
import { FEEDS, MAX_ITEMS_PER_FEED } from "./feeds";
import { fetchFeed, type RawArticle } from "./rss";
import { rewriteArticle, GEMINI_MODEL, type LinkCandidate } from "./rewrite";
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

/** Ensure the slug is unique by appending a short suffix on collision. */
async function uniqueSlug(
  db: FirebaseFirestore.Firestore,
  base: string,
  guidHash: string,
): Promise<string> {
  const existing = await db.collection("posts").doc(base).get();
  if (!existing.exists) return base;
  return `${base}-${guidHash.slice(0, 6)}`;
}

/**
 * Recent published posts the rewriter can link to from new articles.
 * Reuses the existing (status, publishedAt) composite index — no new index.
 */
async function fetchLinkCandidates(
  db: FirebaseFirestore.Firestore,
  limit = 40,
): Promise<LinkCandidate[]> {
  const snap = await db
    .collection("posts")
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc")
    .limit(limit)
    .get();
  return snap.docs.map((d) => ({
    slug: (d.data().slug as string) ?? d.id,
    title: d.data().title as string,
    category: d.data().category as string,
  }));
}

export interface IngestResult {
  feedsProcessed: number;
  created: number;
  skipped: number;
  errors: number;
}

/**
 * Fetch all feeds, rewrite new articles with Gemini, and write them to
 * Firestore. Deduplicates via the `seen` ledger so re-runs are cheap and idempotent.
 */
export async function runIngest(): Promise<IngestResult> {
  const db = getFirestore();
  const result: IngestResult = {
    feedsProcessed: 0,
    created: 0,
    skipped: 0,
    errors: 0,
  };

  // Existing posts the rewriter can link to. Grown in-memory as we create more,
  // so later articles in this run can link back to earlier ones.
  const candidates = await fetchLinkCandidates(db);

  for (const feed of FEEDS) {
    let items: RawArticle[] = [];
    try {
      items = await fetchFeed(feed);
      result.feedsProcessed += 1;
    } catch (err) {
      logger.error(`Failed to fetch feed ${feed.name}`, err);
      result.errors += 1;
      continue;
    }

    let processedForFeed = 0;
    for (const article of items) {
      if (processedForFeed >= MAX_ITEMS_PER_FEED) break;
      if (!article.title || !article.link) continue;

      const seenRef = db.collection("seen").doc(article.guidHash);
      if ((await seenRef.get()).exists) {
        result.skipped += 1;
        continue;
      }

      try {
        const rewritten = await rewriteArticle(article, candidates);
        const base = slugify(rewritten.title || article.title);
        const slug = await uniqueSlug(db, base, article.guidHash);
        const now = FieldValue.serverTimestamp();

        // Generate our own branded cover image; "" on failure falls back to
        // the placeholder on the frontend (never the scraped source image).
        const coverImage = await generateCoverImage(
          rewritten.title,
          rewritten.category,
          slug,
        );

        // Derive the archive period (YYYY-MM) from the publish date.
        const pub = article.publishedAt;
        const year = pub.getUTCFullYear();
        const month = pub.getUTCMonth() + 1; // 1-12
        const ym = `${year}-${String(month).padStart(2, "0")}`;
        const archiveRef = db.collection("archives").doc(ym);

        const postRef = db.collection("posts").doc(slug);
        const batch = db.batch();
        batch.set(postRef, {
          slug,
          title: rewritten.title,
          excerpt: rewritten.excerpt,
          content: rewritten.content,
          category: rewritten.category,
          tags: rewritten.tags,
          coverImage,
          sourceUrl: article.link,
          sourceName: article.feedName,
          status: "published",
          publishedAt: article.publishedAt,
          createdAt: now,
          updatedAt: now,
          readingTimeMinutes: readingTime(rewritten.content),
          metaTitle: rewritten.metaTitle,
          metaDescription: rewritten.metaDescription,
          keywords: rewritten.keywords,
          aiModel: GEMINI_MODEL,
        });
        batch.set(seenRef, {
          sourceUrl: article.link,
          feedName: article.feedName,
          postSlug: slug,
          ingestedAt: now,
        });
        // Maintain the date-archive index (count per month).
        batch.set(
          archiveRef,
          {
            year,
            month,
            count: FieldValue.increment(1),
            lastPublishedAt: article.publishedAt,
          },
          { merge: true },
        );
        await batch.commit();

        // Make this new post linkable by later articles in the same run.
        candidates.unshift({
          slug,
          title: rewritten.title,
          category: rewritten.category,
        });

        processedForFeed += 1;
        result.created += 1;
        logger.info(`Created post "${slug}" from ${feed.name}`);
      } catch (err) {
        logger.error(`Failed to rewrite/store article from ${feed.name}`, err);
        result.errors += 1;
      }
    }
  }

  logger.info("Ingest run complete", result);
  return result;
}
