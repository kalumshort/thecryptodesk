import { createHash, randomUUID } from "crypto";
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

// Curated art-direction pools. We vary the palette (biased by category),
// composition, rendering style, and lighting per post so cards stop looking
// identical — the "AI content farm" look that hurts credibility. Selection is
// deterministic per slug (see `pick`), so a post always renders the same image
// across ingest re-runs and the backfill, while different posts diverge.
const CATEGORY_PALETTES: Record<string, string[]> = {
  bitcoin: ["warm amber and gold tones", "burnt-orange and bronze hues"],
  ethereum: ["cool violet and indigo tones", "deep-purple and silver hues"],
  altcoins: ["vivid cyan and teal tones", "electric-blue and aqua hues"],
  defi: ["fresh acid-green and lime tones", "emerald and mint hues"],
  nft: ["bold magenta and pink tones", "vibrant fuchsia and coral hues"],
  regulation: ["muted steel-blue and slate tones", "cool grey and navy hues"],
  market: ["balanced amber and teal tones", "neutral editorial colour grade"],
};
const DEFAULT_PALETTES = [
  "balanced natural colour grade",
  "muted editorial tones",
];
const COMPOSITIONS = [
  "extreme macro close-up",
  "wide cinematic establishing shot",
  "isometric 3D scene",
  "dramatic low-angle shot",
  "clean overhead flat-lay",
  "symmetrical centered composition",
  "shallow depth-of-field framing",
];
const STYLES = [
  "photorealistic editorial photography",
  "sleek 3D render with soft global illumination",
  "clean matte vector-style illustration",
  "cinematic concept art",
  "minimalist studio product shot",
];
const LIGHTING = [
  "soft natural daylight",
  "dramatic chiaroscuro lighting",
  "warm golden-hour glow",
  "cool overcast tones",
  "high-key bright studio lighting",
  "moody low-key lighting",
];

/** Deterministically pick from `pool`, seeded by `slug` + a per-dimension salt. */
function pick<T>(pool: T[], slug: string, salt: string): T {
  const byte = createHash("sha256").update(`${salt}:${slug}`).digest()[0];
  return pool[byte % pool.length];
}

/**
 * Wrap Gemini's article-specific visual concept (the concrete subject) in a
 * varied art direction — palette (biased by `category`), composition, style, and
 * lighting chosen deterministically from `slug`. Keeps the strict text/logo-free
 * guardrails so we never ship fabricated logos, charts, or numbers on a news
 * site. `title` is the fallback subject if the concept is missing.
 */
function buildPrompt(
  imagePrompt: string,
  title: string,
  slug: string,
  category?: string,
): string {
  const subject = imagePrompt.trim() || title;
  const palette = pick(
    (category && CATEGORY_PALETTES[category]) || DEFAULT_PALETTES,
    slug,
    "palette",
  );
  const composition = pick(COMPOSITIONS, slug, "composition");
  const style = pick(STYLES, slug, "style");
  const lighting = pick(LIGHTING, slug, "lighting");
  return (
    `${style} for a cryptocurrency news article. Subject: ${subject}. ` +
    `${composition}, ${lighting}, ${palette}. Editorial hero image, sleek and ` +
    `professional, wide 16:9 composition. Absolutely no text, no words, no ` +
    `letters, no numbers, no logos, and no charts.`
  );
}

/**
 * @returns a public image URL, or "" on failure.
 */
export async function generateCoverImage(
  imagePrompt: string,
  title: string,
  slug: string,
  category?: string,
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
        instances: [{ prompt: buildPrompt(imagePrompt, title, slug, category) }],
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
