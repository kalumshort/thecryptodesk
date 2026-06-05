import "server-only";
import { getApps, initializeApp, applicationDefault, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

/**
 * Firebase Admin SDK singleton for use in Server Components / route handlers.
 *
 * Authentication is automatic in two scenarios:
 *  - On Firebase App Hosting (Cloud Run): Application Default Credentials are
 *    provided by the runtime service account — no key files needed.
 *  - Local dev against the Firestore emulator: set FIRESTORE_EMULATOR_HOST
 *    (e.g. "127.0.0.1:8080") and GOOGLE_CLOUD_PROJECT in .env.local and the
 *    Admin SDK connects to the emulator with no credentials.
 *
 * Optionally, for local dev against a real project you can provide a service
 * account JSON path via GOOGLE_APPLICATION_CREDENTIALS or set the inline
 * FIREBASE_SERVICE_ACCOUNT env var (stringified JSON).
 */
function createApp() {
  const inlineKey = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (inlineKey) {
    const parsed = JSON.parse(inlineKey);
    return initializeApp({ credential: cert(parsed) });
  }

  // applicationDefault() also works transparently with the emulator when
  // FIRESTORE_EMULATOR_HOST is set.
  return initializeApp({
    credential: applicationDefault(),
    projectId:
      process.env.GOOGLE_CLOUD_PROJECT ?? process.env.GCLOUD_PROJECT,
  });
}

const app = getApps().length ? getApps()[0] : createApp();

export const adminDb = getFirestore(app);
