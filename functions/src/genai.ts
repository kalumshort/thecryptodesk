import { GoogleGenAI, type Schema } from "@google/genai";
import { logger } from "firebase-functions";

/**
 * Shared Gemini client and JSON-generation helper.
 *
 * Replaces `@google-cloud/vertexai`, whose `VertexAI` class was removed on
 * 24 June 2026. It also has no embeddings surface, which the clustering work
 * needs, so there was no version of this migration worth deferring.
 */

/**
 * Gemini text models are NOT served from `us-central1` for this project —
 * every 3.x Flash id returns 404 there and only the retiring `gemini-2.5-flash`
 * responds. They are served from `global`. Imagen is the opposite: it has no
 * `global` endpoint and must stay regional, which is why `generateImage.ts`
 * keeps its own `VERTEX_LOCATION`.
 */
const LOCATION = process.env.GENAI_LOCATION ?? "global";

/**
 * `gemini-2.5-flash` retires 16 October 2026. Chosen by probing what this
 * project can actually reach: 3.5 and 3.6 answered 3/3, while the newer
 * 3.8-flash returned a 429 on one of three calls — not something to put on an
 * hourly cron. Override with GEMINI_MODEL if capacity shifts.
 */
export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-3.6-flash";

function project(): string {
  return process.env.GCLOUD_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT ?? "";
}

// One client for the process, not one per article as the old code did.
let client: GoogleGenAI | null = null;

function ai(): GoogleGenAI {
  if (!client) {
    client = new GoogleGenAI({
      enterprise: true,
      project: project(),
      location: LOCATION,
    });
  }
  return client;
}

/** Retryable: rate limits, capacity, and transient server faults. */
function isTransient(err: unknown): boolean {
  const msg = String((err as Error)?.message ?? err);
  return /\b(429|500|502|503|504)\b|RESOURCE_EXHAUSTED|UNAVAILABLE|DEADLINE_EXCEEDED/i.test(
    msg,
  );
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface GenerateJsonOptions {
  /** 0 for checking work, higher for writing it. */
  temperature?: number;
  maxOutputTokens?: number;
  model?: string;
  /** Total attempts including the first. */
  attempts?: number;
}

/**
 * Generate a JSON object against a response schema.
 *
 * Three failure modes the previous implementation had, fixed here:
 * it read only `parts[0]` (a thinking part first would silently yield ""),
 * it called `JSON.parse` unguarded (a truncated response threw a SyntaxError
 * that burned the article), and it had no retry at all, so a single 429 lost
 * the item for good.
 */
export async function generateJson<T>(
  prompt: string,
  schema: Schema,
  opts: GenerateJsonOptions = {},
): Promise<T> {
  const {
    temperature = 0.5,
    maxOutputTokens = 8192,
    model = GEMINI_MODEL,
    attempts = 3,
  } = opts;

  let lastErr: unknown;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const res = await ai().models.generateContent({
        model,
        contents: prompt,
        config: {
          temperature,
          maxOutputTokens,
          responseMimeType: "application/json",
          responseSchema: schema,
        },
      });

      // Join every part: newer models may emit a thinking part before the JSON.
      const parts = res.candidates?.[0]?.content?.parts ?? [];
      const text = parts
        .map((p) => p.text ?? "")
        .join("")
        .trim();

      if (!text) {
        const reason = res.candidates?.[0]?.finishReason ?? "unknown";
        throw new Error(`empty response from ${model} (finishReason: ${reason})`);
      }

      try {
        return JSON.parse(text) as T;
      } catch {
        // Truncation at the token ceiling is the usual cause; say so rather
        // than surfacing a bare SyntaxError with no context.
        const finish = res.candidates?.[0]?.finishReason ?? "unknown";
        throw new Error(
          `${model} returned unparseable JSON (finishReason: ${finish}, ` +
            `${text.length} chars): ${text.slice(0, 200)}`,
        );
      }
    } catch (err) {
      lastErr = err;
      if (attempt < attempts && isTransient(err)) {
        const backoff = 2 ** (attempt - 1) * 2000 + Math.random() * 1000;
        logger.warn(
          `generateJson transient failure (attempt ${attempt}/${attempts}), ` +
            `retrying in ${Math.round(backoff)}ms`,
          { model, error: String((err as Error)?.message).slice(0, 200) },
        );
        await sleep(backoff);
        continue;
      }
      throw err;
    }
  }

  throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
}

/** Embedding model and width used for clustering. */
export const EMBEDDING_MODEL = "gemini-embedding-001";
export const EMBEDDING_DIMS = 1536;

/**
 * Embed texts for clustering. Returns one L2-normalised vector per input, so
 * cosine similarity is a plain dot product.
 *
 * `gemini-embedding-001` does NOT normalise below its native 3072 dimensions —
 * measured norm at 1536 is ~0.70 — so normalising here is required, not
 * defensive. Firestore's vector index caps at 2048 dimensions, so the
 * truncation itself is unavoidable.
 */
export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const res = await ai().models.embedContent({
    model: EMBEDDING_MODEL,
    contents: texts,
    config: {
      taskType: "CLUSTERING",
      outputDimensionality: EMBEDDING_DIMS,
    },
  });

  const out = (res.embeddings ?? []).map((e) => {
    const v = e.values ?? [];
    const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
    return v.map((x) => x / norm);
  });

  if (out.length !== texts.length) {
    throw new Error(
      `embedTexts: asked for ${texts.length} vectors, got ${out.length}`,
    );
  }
  return out;
}
