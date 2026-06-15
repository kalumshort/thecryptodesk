import { initializeApp } from "firebase-admin/app";
import { setGlobalOptions } from "firebase-functions/v2";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import { logger } from "firebase-functions/v2";
import { runIngest } from "./ingest";
import { backfillArchives } from "./backfill";
import { generateGuides } from "./generateGuides";

initializeApp();

// Vertex AI calls can be slow; give functions room and pin the region so it
// matches the Vertex AI location. Run as the Firebase Admin SDK service
// account, which already has Firestore access — grant it the "Vertex AI User"
// role (roles/aiplatform.user) so it can call Gemini.
setGlobalOptions({
  region: "us-central1",
  memory: "512MiB",
  timeoutSeconds: 540,
  serviceAccount:
    "firebase-adminsdk-fbsvc@thecryptodesk-d6b0f.iam.gserviceaccount.com",
});

/**
 * Scheduled pipeline: every hour, fetch crypto RSS feeds, rewrite new
 * articles with Gemini, and publish them to Firestore.
 */
export const scheduledNewsIngest = onSchedule(
  { schedule: "every 60 minutes", retryCount: 1 },
  async () => {
    await runIngest();
  },
);

/**
 * Manual trigger for testing / on-demand runs.
 * Protected by a shared secret: call with ?key=INGEST_TRIGGER_KEY.
 * Set the secret via `firebase functions:secrets:set INGEST_TRIGGER_KEY`.
 */
export const runIngestNow = onRequest(
  { secrets: ["INGEST_TRIGGER_KEY"] },
  async (req, res) => {
    const expected = process.env.INGEST_TRIGGER_KEY;
    // In the emulator the secret is usually unset — allow it there for testing.
    const isEmulator = !!process.env.FUNCTIONS_EMULATOR;
    if (expected && req.query.key !== expected && !isEmulator) {
      res.status(403).send("Forbidden");
      return;
    }
    try {
      const result = await runIngest();
      res.status(200).json(result);
    } catch (err) {
      logger.error("Manual ingest failed", err);
      res.status(500).send("Ingest failed");
    }
  },
);

/**
 * Generate Learn-hub guides from the curated topic list. Idempotent — existing
 * guides are skipped, so it's safe to run repeatedly after adding new topics.
 *
 * This is a Scheduler-backed function rather than a public HTTP trigger because
 * the org policy forbids unauthenticated functions. The cron is effectively
 * "never" (yearly); to run it on demand, open Cloud Scheduler in the console
 * and use **Force run** on this job. Scheduler invokes it with internal OIDC
 * auth, so no public access, secret, or local credentials are needed.
 */
export const scheduledGuidesGenerate = onSchedule(
  { schedule: "0 0 1 1 *", retryCount: 0 },
  async () => {
    await generateGuides();
  },
);

/**
 * One-time (idempotent) rebuild of the date-archive index from existing posts.
 * Protected by the same shared secret: call with ?key=INGEST_TRIGGER_KEY.
 */
export const backfillArchivesNow = onRequest(
  { secrets: ["INGEST_TRIGGER_KEY"] },
  async (req, res) => {
    const expected = process.env.INGEST_TRIGGER_KEY;
    const isEmulator = !!process.env.FUNCTIONS_EMULATOR;
    if (expected && req.query.key !== expected && !isEmulator) {
      res.status(403).send("Forbidden");
      return;
    }
    try {
      const result = await backfillArchives();
      res.status(200).json(result);
    } catch (err) {
      logger.error("Archive backfill failed", err);
      res.status(500).send("Backfill failed");
    }
  },
);
