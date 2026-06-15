// Market sentiment — the Crypto Fear & Greed Index from alternative.me
// (free, no API key). Cached via Next's `revalidate`; degrades to null on
// failure so the widget simply doesn't render rather than breaking the page.

const FNG_URL = "https://api.alternative.me/fng/?limit=1";
const FNG_REVALIDATE = 1800; // index updates roughly daily; 30 min is plenty.

export interface FearGreed {
  value: number; // 0–100
  classification: string; // e.g. "Fear", "Greed"
}

interface RawFng {
  data?: { value: string; value_classification: string }[];
}

/** Latest Fear & Greed reading, or null if unavailable. */
export async function getFearGreed(): Promise<FearGreed | null> {
  try {
    const res = await fetch(FNG_URL, {
      headers: { accept: "application/json" },
      next: { revalidate: FNG_REVALIDATE },
    });
    if (!res.ok) {
      console.error(`[sentiment] getFearGreed HTTP ${res.status}`);
      return null;
    }
    const raw = (await res.json()) as RawFng;
    const entry = raw.data?.[0];
    if (!entry) return null;
    const value = Number(entry.value);
    if (Number.isNaN(value)) return null;
    return { value, classification: entry.value_classification };
  } catch (err) {
    console.error("[sentiment] getFearGreed failed:", err);
    return null;
  }
}

/** Palette color for a 0–100 sentiment score: red → amber → green. */
export function fearGreedColor(value: number): string {
  if (value < 25) return "var(--magenta)"; // extreme fear
  if (value < 45) return "var(--amber)"; // fear
  if (value < 55) return "var(--cyan)"; // neutral
  if (value < 75) return "var(--acid)"; // greed
  return "var(--acid)"; // extreme greed
}
