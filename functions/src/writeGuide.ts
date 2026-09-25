import { Type, type Schema } from "@google/genai";
import { GEMINI_MODEL, generateJson } from "./genai";
import type { GuideTopic } from "./guideTopics";

export { GEMINI_MODEL };

/** AI-written parts of a guide. Title/level/topic/order come from the topic. */
export interface WrittenGuide {
  excerpt: string;
  content: string; // Markdown
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  imagePrompt: string;
}

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    excerpt: { type: Type.STRING },
    content: { type: Type.STRING },
    tags: { type: Type.ARRAY, items: { type: Type.STRING } },
    metaTitle: { type: Type.STRING },
    metaDescription: { type: Type.STRING },
    keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
    imagePrompt: { type: Type.STRING },
  },
  required: [
    "excerpt",
    "content",
    "tags",
    "metaTitle",
    "metaDescription",
    "keywords",
    "imagePrompt",
  ],
};

const SYSTEM_PROMPT = `You are an expert cryptocurrency educator writing for "TheCryptoDesk" Learn hub.
You write clear, friendly tutorials for COMPLETE NEWCOMERS. Rules:
- Write in plain, simple English. Define every piece of jargon the first time you use it.
- Be accurate, neutral, and practical. NEVER give financial advice or predict prices. Do not tell people to buy or sell.
- "content" must be 600-800 words of clean Markdown, written to teach and reassure a nervous beginner. Structure it for easy learning:
  - Open with 1-2 sentences in plain text that say what the reader will learn (NO heading first, NO H1).
  - Use 3-4 H2 (##) subheadings to break the guide into clear steps or ideas.
  - Where it helps, use a short numbered list for steps or a bullet list for key points.
  - Use **bold** for the key terms a beginner should remember. Keep paragraphs short (2-4 sentences).
  - End with a short "Key takeaways" bullet list (2-4 bullets).
- Include a brief, friendly safety reminder where relevant (e.g. never share a seed phrase, only invest what you can afford to lose).
- "excerpt" is a single inviting sentence describing the guide (max 160 chars).
- "metaTitle" <= 60 chars, "metaDescription" <= 155 chars, both SEO-optimised and beginner-focused.
- "tags" and "keywords": 3-6 lowercase items each.
- "imagePrompt": ONE sentence naming a single concrete, friendly visual subject for the guide's cover image (e.g. "a glowing hardware wallet on a desk", "a simple chain of glowing blocks"). Describe the SUBJECT ONLY. Do NOT mention art style, colours, lighting, text, words, or logos — those are added automatically.
Return ONLY the JSON object matching the schema.`;

/** Write an educational guide for one topic via Gemini. */
export async function writeGuide(topic: GuideTopic): Promise<WrittenGuide> {
  const userPrompt = `${SYSTEM_PROMPT}

GUIDE TO WRITE
Title (use exactly this as the subject; do not restate it as an H1): ${topic.title}
Difficulty level: ${topic.level}
What it should teach: ${topic.brief}`;

  return generateJson<WrittenGuide>(userPrompt, responseSchema, {
    temperature: 0.6,
    maxOutputTokens: 8192,
  });
}
