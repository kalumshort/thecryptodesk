// One-time (idempotent) rebuild of the `archives/{YYYY-MM}` index from existing
// published posts. Runs locally against cloud Firestore using your gcloud ADC.
//
//   node scripts/backfill-archives.mjs
//
// Safe to run repeatedly — it overwrites archive docs, it does not increment.

import { initializeApp, applicationDefault, getApps } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = process.env.GOOGLE_CLOUD_PROJECT ?? "thecryptodesk-d6b0f";

if (!getApps().length) {
  initializeApp({ credential: applicationDefault(), projectId });
}
const db = getFirestore();

const snap = await db
  .collection("posts")
  .where("status", "==", "published")
  .get();

const buckets = new Map();
for (const doc of snap.docs) {
  const pub = doc.data().publishedAt;
  if (!pub?.toDate) continue;
  const d = pub.toDate();
  const year = d.getUTCFullYear();
  const month = d.getUTCMonth() + 1;
  const ym = `${year}-${String(month).padStart(2, "0")}`;

  const b = buckets.get(ym);
  if (b) {
    b.count += 1;
    if (pub.toMillis() > b.lastPublishedAt.toMillis()) b.lastPublishedAt = pub;
  } else {
    buckets.set(ym, { year, month, count: 1, lastPublishedAt: pub });
  }
}

const batch = db.batch();
for (const [ym, b] of buckets) {
  batch.set(db.collection("archives").doc(ym), b);
}
await batch.commit();

console.log(
  `Backfill complete: ${snap.size} posts → ${buckets.size} archive months`,
);
for (const [ym, b] of [...buckets].sort((a, b) => (a[0] < b[0] ? 1 : -1))) {
  console.log(`  ${ym}: ${b.count}`);
}
process.exit(0);
