import { randomUUID } from "crypto";
import { getStorage } from "firebase-admin/storage";
import { GoogleAuth } from "google-auth-library";
import { logger } from "firebase-functions/v2";

/**
 * Generates an original, branded cover image for a post with Google Imagen 4
 * Fast (Vertex AI) and stores it in Cloud Storage. Returns a public URL, or ""
 * on any failure so the caller can fall back to the placeholder without
 * aborting the post.
 *
 * Auth is via Application Default Credentials — the Functions service account
 * already holds the "Vertex AI User" role used by the Gemini rewrite step, so
 * no extra API keys are needed. It must additionally be able to write to the
 * storage bucket (the Firebase Admin SDK service account has this by default).
 */

const LOCATION = process.env.VERTEX_LOCATION ?? "us-central1";
const PROJECT =
  process.env.GCLOUD_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT ?? "";
// Imagen 4 Fast: cheapest Google tier (~$0.02/image). Override via env if the
// model id changes. See cloud.google.com/vertex-ai/generative-ai docs.
const IMAGEN_MODEL = process.env.IMAGEN_MODEL ?? "imagen-4.0-fast-generate-001";
// Dedicated bucket for post cover images, linked to Firebase Storage. Served
// via Firebase download-token URLs (below) rather than public IAM, because the
// org policy (iam.allowedPolicyMemberDomains) forbids public buckets. Override
// with IMAGE_BUCKET if renamed.
const BUCKET = process.env.IMAGE_BUCKET ?? `${PROJECT}-post-images`;

const auth = new GoogleAuth({
  scopes: "https://www.googleapis.com/auth/cloud-platform",
});

interface ImagenPrediction {
  bytesBase64Encoded?: string;
  mimeType?: string;
}

/** Build a branded, text-free neon/cyberpunk prompt from the post metadata. */
function buildPrompt(title: string, category: string): string {
  return (
    `Abstract cyberpunk digital illustration for a cryptocurrency news article ` +
    `titled "${title}". Theme: ${category}. Glowing neon cyan and violet light ` +
    `on a dark, futuristic, high-tech background. Editorial hero image, cinematic, ` +
    `sleek. Absolutely no text, no words, no letters, no numbers, no logos, and ` +
    `no charts. Wide 16:9 composition.`
  );
}

/**
 * @returns a public image URL, or "" on failure.
 */
export async function generateCoverImage(
  title: string,
  category: string,
  slug: string,
): Promise<string> {
  if (!PROJECT) {
    logger.error("[image] No project id in env; skipping image generation");
    return "";
  }

  try {
    const client = await auth.getClient();
    const accessToken = (await client.getAccessToken()).token;
    if (!accessToken) throw new Error("Failed to obtain access token");

    const url =
      `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT}` +
      `/locations/${LOCATION}/publishers/google/models/${IMAGEN_MODEL}:predict`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        instances: [{ prompt: buildPrompt(title, category) }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "16:9",
          personGeneration: "allow_adult",
        },
      }),
    });

    if (!res.ok) {
      const detail = await res.text();
      throw new Error(`Imagen predict ${res.status}: ${detail.slice(0, 500)}`);
    }

    const data = (await res.json()) as { predictions?: ImagenPrediction[] };
    const b64 = data.predictions?.[0]?.bytesBase64Encoded;
    if (!b64) throw new Error("Imagen returned no image bytes");

    const buffer = Buffer.from(b64, "base64");
    const objectPath = `posts/${slug}.png`;
    const downloadToken = randomUUID();
    await getStorage()
      .bucket(BUCKET)
      .file(objectPath)
      .save(buffer, {
        resumable: false,
        contentType: "image/png",
        metadata: {
          cacheControl: "public, max-age=31536000, immutable",
          // Firebase download token grants read access without public IAM.
          metadata: { firebaseStorageDownloadTokens: downloadToken },
        },
      });

    return (
      `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/` +
      `${encodeURIComponent(objectPath)}?alt=media&token=${downloadToken}`
    );
  } catch (err) {
    logger.error(`[image] generateCoverImage failed for "${slug}"`, err);
    return "";
  }
}
