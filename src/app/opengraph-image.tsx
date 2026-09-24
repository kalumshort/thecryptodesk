import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/seo";

/**
 * Site-wide OpenGraph card.
 *
 * Takes no params and reads no remote data, so it is rendered once at build
 * time and costs nothing per request. Every route without a more specific
 * image inherits it — previously sharing a link to anything but an article
 * produced a card with no image at all.
 *
 * Do NOT add `export const runtime = "edge"`: `ImageResponse` runs fine on
 * Node, and Firebase App Hosting has no edge runtime to switch to.
 */
export const alt = `${SITE_NAME} — Cryptocurrency News`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  // `next/font` can't be used inside ImageResponse — Satori needs raw font
  // bytes, so the TTF is committed under assets/ and read from disk.
  const orbitron = await readFile(
    join(process.cwd(), "assets", "SpaceGrotesk-Bold.ttf"),
  );

  return new ImageResponse(
    (
      // Satori supports flexbox and absolute positioning only — no CSS grid.
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#05070D",
          backgroundImage:
            "radial-gradient(circle at 12% 0%, rgba(163,107,255,0.20), transparent 45%), radial-gradient(circle at 88% 100%, rgba(34,224,255,0.18), transparent 50%)",
          color: "#E8F0FF",
        }}
      >
        {/* Satori needs `display: flex` on ANY element with more than one
            child, and it has no `◆` glyph in this font — a decorative glyph
            here triggers a dynamic font download that fails at build time. */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            fontFamily: "Space Grotesk",
            fontSize: 76,
            letterSpacing: -1,
          }}
        >
          <span style={{ color: "#22e0ff" }}>The</span>
          <span>CryptoDesk</span>
        </div>

        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 34,
            lineHeight: 1.35,
            color: "#9DB0CE",
            maxWidth: 900,
          }}
        >
          {SITE_DESCRIPTION}
        </div>

        <div
          style={{
            position: "absolute",
            left: 80,
            bottom: 72,
            display: "flex",
            height: 6,
            width: 240,
            background: "linear-gradient(to right, #22e0ff, #a36bff)",
          }}
        />
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Space Grotesk",
          data: orbitron as unknown as ArrayBuffer,
          style: "normal",
          weight: 700,
        },
      ],
    },
  );
}
