/**
 * FAQPage extraction from guide Markdown.
 *
 * Structured data must describe content that is actually visible on the page,
 * so this only ever emits Q&A pairs that genuinely exist: an `##` heading
 * phrased as a question, plus the prose that follows it. Headings that are not
 * questions are ignored rather than reworded into fake ones — inventing Q&A
 * markup is a structured-data spam violation, not an optimisation.
 *
 * Note that Google restricted FAQ rich results to government and health sites
 * in 2023, so this markup rarely produces a visible SERP feature today. It
 * remains a correct, cheap description of the page for other consumers.
 */

import { stripMarkdown } from "@/lib/markdown";

export interface FaqPair {
  question: string;
  answer: string;
}

const MIN_PAIRS = 2;
const MIN_ANSWER_CHARS = 40;
const MAX_ANSWER_CHARS = 700;

/**
 * Extract question-form `##` sections from a guide body. Returns `[]` when the
 * guide has fewer than two genuine questions, in which case no FAQPage markup
 * should be emitted at all.
 */
export function extractFaq(markdown: string): FaqPair[] {
  const lines = markdown.split("\n");
  const pairs: FaqPair[] = [];

  let question: string | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (question === null) return;
    const answer = stripMarkdown(buffer.join("\n"));
    if (answer.length >= MIN_ANSWER_CHARS) {
      pairs.push({
        question,
        answer:
          answer.length > MAX_ANSWER_CHARS
            ? `${answer.slice(0, MAX_ANSWER_CHARS).trimEnd()}…`
            : answer,
      });
    }
    question = null;
    buffer = [];
  };

  for (const line of lines) {
    const heading = /^##\s+(.+?)\s*$/.exec(line);
    if (heading) {
      flush();
      const text = stripMarkdown(heading[1]);
      // Only headings that are actually questions become FAQ entries.
      question = text.endsWith("?") ? text : null;
      continue;
    }
    // A deeper heading ends the current answer without starting a new question.
    if (/^#{3,}\s+/.test(line)) {
      flush();
      continue;
    }
    if (question !== null) buffer.push(line);
  }
  flush();

  return pairs.length >= MIN_PAIRS ? pairs : [];
}

/** schema.org FAQPage JSON-LD, or null when the page has no real Q&A. */
export function faqPageJsonLd(pairs: FaqPair[]) {
  if (pairs.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map((p) => ({
      "@type": "Question",
      name: p.question,
      acceptedAnswer: { "@type": "Answer", text: p.answer },
    })),
  };
}
