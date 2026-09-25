import { createHash, randomUUID } from "crypto";
import { getStorage } from "firebase-admin/storage";
import { GoogleGenAI } from "@google/genai";
import { logger } from "firebase-functions/v2";

/**
 * Generates an original, branded cover image for a post and stores it in Cloud
 * Storage. Returns a public URL, or "" on any failure so the caller can fall
 * back to the placeholder without aborting the post.
 *
 * Previously this called Imagen 4 Fast over the REST `:predict` endpoint. That
 * model no longer exists in this project's catalogue — it had been returning
 * 404 on EVERY post for some time, silently, because failures return "" rather
 * than throwing. That is why so many posts carry the placeholder cover.
 *
 * Auth is Application Default Credentials; the Functions service account
 * already holds Vertex AI User for the text steps and can write to the bucket.
 */

const PROJECT =
  process.env.GCLOUD_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT ?? "";

/**
 * Image models are served from `global`, not from a region — the regional
 * endpoint 404s for every one of them, which is the same trap the text models
 * are in.
 *
 * `gemini-3.1-flash-lite-image` measured against the alternatives: ~5s and a
 * ~140KB JPEG, versus ~12s and a ~1.7MB PNG for the full flash-image model, at
 * indistinguishable quality for a 16:9 editorial cover. On a page where cover
 * images are the LCP element, the smaller file is the better image.
 */
const IMAGE_LOCATION = process.env.IMAGE_LOCATION ?? "global";
const IMAGE_MODEL = process.env.IMAGE_MODEL ?? "gemini-3.1-flash-lite-image";
// Dedicated bucket for post cover images, linked to Firebase Storage. Served
// via Firebase download-token URLs (below) rather than public IAM, because the
// org policy (iam.allowedPolicyMemberDomains) forbids public buckets. Override
// with IMAGE_BUCKET if renamed.
const BUCKET = process.env.IMAGE_BUCKET ?? `${PROJECT}-post-images`;

let client: GoogleGenAI | null = null;

function ai(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({
      enterprise: true,
      project: PROJECT,
      location: IMAGE_LOCATION,
    });
  }
  return client;
}

/** Map the model's reported mime type to a file extension. */
function extensionFor(mime: string): string {
  if (mime.includes("jpeg") || mime.includes("jpg")) return "jpg";
  if (mime.includes("webp")) return "webp";
  return "png";
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
    const res = await ai().models.generateContent({
      model: IMAGE_MODEL,
      contents: buildPrompt(imagePrompt, title, slug, category),
      config: { responseModalities: ["IMAGE"] },
    });

    const parts = res.candidates?.[0]?.content?.parts ?? [];
    const inline = parts.find((p) => p.inlineData?.data)?.inlineData;
    if (!inline?.data) {
      const reason = res.candidates?.[0]?.finishReason ?? "unknown";
      throw new Error(
        `${IMAGE_MODEL} returned no image (finishReason: ${reason}, ` +
          `parts: ${parts.length})`,
      );
    }

    const mime = inline.mimeType ?? "image/png";
    const buffer = Buffer.from(inline.data, "base64");
    const objectPath = `posts/${slug}.${extensionFor(mime)}`;
    const downloadToken = randomUUID();

    await getStorage()
      .bucket(BUCKET)
      .file(objectPath)
      .save(buffer, {
        resumable: false,
        contentType: mime,
        metadata: {
          cacheControl: "public, max-age=31536000, immutable",
          // Firebase download token grants read access without public IAM.
          metadata: { firebaseStorageDownloadTokens: downloadToken },
        },
      });

    logger.info(
      `[image] generated ${slug} (${Math.round(buffer.length / 1024)}KB ${mime})`,
    );

    return (
      `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/` +
      `${encodeURIComponent(objectPath)}?alt=media&token=${downloadToken}`
    );
  } catch (err) {
    logger.error(`[image] generateCoverImage failed for "${slug}"`, err);
    return "";
  }
}
