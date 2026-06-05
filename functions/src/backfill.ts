import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { logger } from "firebase-functions/v2";

interface Bucket {
  year: number;
  month: number;
  count: number;
  lastPublishedAt: Timestamp;
}

/**
 * Rebuilds the `archives/{YYYY-MM}` index from scratch by scanning published
 * posts. Idempotent — safe to run multiple times (overwrites, not increments).
 * Use once to seed archives for posts created before the index existed.
 */
export async function backfillArchives(): Promise<{
  posts: number;
  months: number;
}> {
  const db = getFirestore();
  const snap = await db
    .collection("posts")
    .where("status", "==", "published")
    .get();

  const buckets = new Map<string, Bucket>();
  for (const doc of snap.docs) {
    const pub = doc.data().publishedAt as Timestamp | undefined;
    if (!pub?.toDate) continue;
    const d = pub.toDate();
    const year = d.getUTCFullYear();
    const month = d.getUTCMonth() + 1;
    const ym = `${year}-${String(month).padStart(2, "0")}`;

    const existing = buckets.get(ym);
    if (existing) {
      existing.count += 1;
      if (pub.toMillis() > existing.lastPublishedAt.toMillis()) {
        existing.lastPublishedAt = pub;
      }
    } else {
      buckets.set(ym, { year, month, count: 1, lastPublishedAt: pub });
    }
  }

  const batch = db.batch();
  for (const [ym, b] of buckets) {
    batch.set(db.collection("archives").doc(ym), b);
  }
  await batch.commit();

  const result = { posts: snap.size, months: buckets.size };
  logger.info("Archive backfill complete", result);
  return result;
}
