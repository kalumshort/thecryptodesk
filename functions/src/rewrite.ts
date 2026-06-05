import { VertexAI, SchemaType, type ResponseSchema } from "@google-cloud/vertexai";
import { CATEGORIES } from "./feeds";
import type { RawArticle } from "./rss";

export const GEMINI_MODEL = "gemini-2.5-flash";
const LOCATION = process.env.VERTEX_LOCATION ?? "us-central1";

export interface RewrittenPost {
  title: string;
  excerpt: string;
  content: string; // Markdown
  category: (typeof CATEGORIES)[number];
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
}

/** An existing post the rewriter may link to from the new article's body. */
export interface LinkCandidate {
  slug: string;
  title: string;
  category: string;
}

const responseSchema: ResponseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    excerpt: { type: SchemaType.STRING },
    content: { type: SchemaType.STRING },
    category: { type: SchemaType.STRING, enum: [...CATEGORIES] },
    tags: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
    metaTitle: { type: SchemaType.STRING },
    metaDescription: { type: SchemaType.STRING },
    keywords: { type: SchemaType.ARRAY, items: { type: SchemaType.STRING } },
  },
  required: [
    "title",
    "excerpt",
    "content",
    "category",
    "tags",
    "metaTitle",
    "metaDescription",
    "keywords",
  ],
};

function getModel() {
  const project =
    process.env.GCLOUD_PROJECT ?? process.env.GOOGLE_CLOUD_PROJECT;
  const vertex = new VertexAI({ project, location: LOCATION });
  return vertex.getGenerativeModel({
    model: GEMINI_MODEL,
    generationConfig: {
      temperature: 0.7,
      maxOutputTokens: 4096,
      responseMimeType: "application/json",
      responseSchema,
    },
  });
}

const SYSTEM_PROMPT = `You are a senior cryptocurrency news editor for "TheCryptoDesk".
You will be given the raw text of a third-party crypto news article.
Rewrite it as an original, factual, and engaging news post. Rules:
- Completely rewrite in your own words. Do NOT copy sentences from the source.
- Be neutral and factual. Do not invent facts, prices, quotes, images, or charts not in the source.
- "content" must be 450-550 words of clean Markdown, written in plain, simple language that keeps a casual reader moving. Structure it for easy scanning:
  - Open with a 1-2 sentence lead/hook in plain text (NO heading first, NO H1).
  - Break the body up with 2-3 H2 (##) subheadings.
  - Include one short bullet list of the key takeaways or key points where it aids scanning.
  - Use **bold** for the key terms, names, and numbers. Keep paragraphs short (2-4 sentences).
- "excerpt" is a single compelling sentence (max 160 chars).
- "metaTitle" <= 60 chars, "metaDescription" <= 155 chars, both SEO-optimised.
- "category" MUST be one of: ${CATEGORIES.join(", ")}.
- "tags" and "keywords": 3-6 lowercase items each.
Return ONLY the JSON object matching the schema.`;

/** Build the "RELATED POSTS" prompt block + linking instructions, or "" if none. */
function buildLinkSection(candidates: LinkCandidate[]): string {
  if (candidates.length === 0) return "";
  const list = candidates
    .map((c) => `- "${c.title}" -> /news/${c.slug} (${c.category})`)
    .join("\n");
  return `

RELATED POSTS (already published on TheCryptoDesk)
${list}

LINKING INSTRUCTIONS
- Weave 1-3 inline Markdown links into "content" pointing to the MOST relevant related posts above.
- Use the EXACT "/news/<slug>" path shown and natural anchor text, e.g. [the latest Bitcoin ETF inflows](/news/some-slug).
- Only link when a post is genuinely relevant to what you are writing. Never link a slug that is not in the list above. Never link the same slug twice.`;
}

/** Rewrite a raw article into an original, SEO-ready post via Gemini. */
export async function rewriteArticle(
  article: RawArticle,
  candidates: LinkCandidate[] = [],
): Promise<RewrittenPost> {
  const model = getModel();
  const userPrompt = `${SYSTEM_PROMPT}${buildLinkSection(candidates)}

SOURCE ARTICLE
Title: ${article.title}
Source: ${article.feedName}
Body:
${article.content || article.summary}`;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
  });

  const text =
    result.response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!text) throw new Error("Gemini returned an empty response");

  const parsed = JSON.parse(text) as RewrittenPost;

  // Defensive: ensure category is valid.
  if (!(CATEGORIES as readonly string[]).includes(parsed.category)) {
    parsed.category = "market";
  }

  // Defensive: strip any /news/ links the model invented for slugs that don't
  // exist, unwrapping them to plain text so we never ship dead internal links.
  const valid = new Set(candidates.map((c) => c.slug));
  parsed.content = parsed.content.replace(
    /\[([^\]]+)\]\(\/news\/([^)\s]+)\)/g,
    (match, anchor: string, slug: string) => (valid.has(slug) ? match : anchor),
  );

  return parsed;
}
