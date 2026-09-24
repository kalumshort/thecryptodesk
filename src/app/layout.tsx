import type { Metadata } from "next";
import { Space_Grotesk, Newsreader, Space_Mono } from "next/font/google";
import { GoogleAnalytics } from "@next/third-parties/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { MarketTicker } from "@/components/market-ticker";
import { SiteFooter } from "@/components/site-footer";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  absoluteUrl,
  organizationJsonLd,
  siteUrl,
  websiteJsonLd,
} from "@/lib/seo";

// Display: Space Grotesk — headlines, the wordmark, navigation, UI.
// Replaces Orbitron, which is the default shorthand for "futuristic" and so
// the house face of crypto scam sites — the one association a news desk
// cannot afford.
const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// Body: Newsreader — article and guide prose. A serif drawn for screen
// reading; the previous body face was a monospace, which is slow at length.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
  display: "swap",
});

// Data: Space Mono — prices, timestamps, tickers, labels. Figures align in a
// column. Kept from the old system: it was the one face doing real work.
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

// Analytics / verification are opt-in via env so local dev and preview builds
// stay silent — no GA hits, no stray verification tag.
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;
const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION;

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
  // Search Console ownership. Omitted entirely when the env var is unset so we
  // never emit an empty verification meta tag.
  verification: GSC_VERIFICATION ? { google: GSC_VERIFICATION } : undefined,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`dark ${grotesk.variable} ${newsreader.variable} ${spaceMono.variable} h-full antialiased`}
    >
      <body
        className="relative flex min-h-full flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        {/* Site-wide structured data: publisher identity + site entity. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd()),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd()) }}
        />

        <div className="relative z-10 flex min-h-full flex-col">
          <SiteHeader />
          <MarketTicker />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
      {GA_ID ? <GoogleAnalytics gaId={GA_ID} /> : null}
    </html>
  );
}
