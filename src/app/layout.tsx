import type { Metadata } from "next";
import { Orbitron, Space_Mono } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { MarketTicker } from "@/components/market-ticker";
import { SiteFooter } from "@/components/site-footer";
import { NeuralMesh } from "@/components/neural-mesh";
import { DiamondCursor } from "@/components/diamond-cursor";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  organizationJsonLd,
  siteUrl,
  websiteJsonLd,
} from "@/lib/seo";

// Display: Orbitron — cold, geometric, precise.
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

// Body: Space Mono — biological, mechanical.
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: `${SITE_NAME} — Cryptocurrency News`,
    template: `%s · ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: {
    types: { "application/rss+xml": absoluteUrl("/feed.xml") },
  },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Cryptocurrency News`,
    description: SITE_DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${orbitron.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body
        className="relative flex min-h-full flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        {/* Site-wide structured data: publisher identity + site entity. */}
        {/* eslint-disable-next-line react/no-danger */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        {/* eslint-disable-next-line react/no-danger */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />

        {/* Living mycelial background + diamond cursor */}
        <NeuralMesh />
        <DiamondCursor />

        <div className="relative z-10 flex min-h-full flex-col">
          <SiteHeader />
          <MarketTicker />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
