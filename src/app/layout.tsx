import type { Metadata } from "next";
import { Orbitron, Space_Mono } from "next/font/google";
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

// Display: Orbitron — cold, geometric, precise. Only 700/800 are actually used
// (`font-bold` / `font-extrabold`); the other four weights were dead payload.
const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["700", "800"],
  display: "swap",
});

// Body: Space Mono — biological, mechanical.
const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
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
      className={`dark ${orbitron.variable} ${spaceMono.variable} h-full antialiased`}
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
