import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_NAME } from "@/lib/seo";
import { CATEGORIES, CATEGORY_LABELS, isCategory } from "@/types/post";
import { CATEGORY_COLOR } from "@/lib/category-style";

/**
 * Per-category OpenGraph card, accented with that category's palette colour.
 *
 * `generateStaticParams` covers all seven categories so every card is
 * rasterised at build time. Cardinality here is fixed and tiny — which is
 * exactly why tag, archive and article routes deliberately do NOT get one:
 * rasterising per request on a 1-vCPU instance is the failure mode to avoid.
 */
export const alt = `${SITE_NAME} category`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}

/** Palette vars resolve to nothing inside Satori, so map to literals here. */
const HEX: Record<string, string> = {
  "var(--cyan)": "#22e0ff",
  "var(--violet)": "#b06bff",
  "var(--acid)": "#b6ff3c",
  "var(--magenta)": "#ff3ca6",
  "var(--amber)": "#ffb43c",
};

export default async function Image({
  params,
}: {
  // `params` is a Promise here, exactly as it is in page components — typing it
  // as a plain object silently yields `undefined` and every card renders the
  // generic fallback instead of its category.
  params: Promise<{ category: string }>;
}) {
  const { category } = await params;
  const label = isCategory(category) ? CATEGORY_LABELS[category] : "News";
  const accent = isCategory(category)
    ? (HEX[CATEGORY_COLOR[category]] ?? "#22e0ff")
    : "#22e0ff";

  const orbitron = await readFile(
    join(process.cwd(), "assets", "Orbitron-ExtraBold.ttf"),
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#04050a",
          color: "#d7e6ff",
        }}
      >
        {/* No `◆` here: Satori has no glyph for it in this font and falls back
            to a dynamic font download, which fails during the build. Every
            element below also carries `display: flex`, which Satori requires
            on anything with more than one child node. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: accent,
          }}
        >
          {SITE_NAME}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 24,
            fontFamily: "Orbitron",
            fontSize: 96,
            letterSpacing: -2,
            color: accent,
          }}
        >
          {label}
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 20,
            fontSize: 34,
            color: "#9fb0d0",
          }}
        >
          {`Latest ${label} news and analysis`}
        </div>

        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            display: "flex",
            height: 10,
            width: "100%",
            background: `linear-gradient(to right, ${accent}, transparent)`,
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Orbitron",
          data: orbitron as unknown as ArrayBuffer,
          style: "normal",
          weight: 800,
        },
      ],
    },
  );
}
