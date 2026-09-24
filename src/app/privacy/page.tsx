import type { Metadata } from "next";
import { PostBody } from "@/components/post-body";
import { StaticPage } from "@/components/static-page";
import { CONTACT_EMAIL, SITE_NAME, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `What data ${SITE_NAME} collects, what it does not, and who it is shared with.`,
  alternates: { canonical: absoluteUrl("/privacy") },
};

const UPDATED = "2026-09-23";

const CONTENT = `
The short version: we have no accounts, no logins, no newsletter and no
comments, so there is very little about you for us to hold.

## What we collect

**Analytics.** We use Google Analytics 4 to count visits and see which articles
people read. It sets cookies and records things like the pages you view, roughly
where in the world you are, and what kind of device and browser you used. IP
addresses are anonymised by Google before we see anything. We look at this in
aggregate; we are not trying to identify you and have no way to do so.

**Server logs.** Our host (Google Cloud) keeps standard request logs, including
IP addresses, for operational and security purposes.

That is the complete list. We do not run advertising, and there are no
third-party ad or tracking pixels on this site.

## What we do not collect

We do not ask for your name, email address or payment details, because there is
nothing here to sign up for or buy. We do not sell data, because we do not have
any worth selling. We do not build profiles of visitors.

## Third parties

Three external services are involved in serving this site:

- **Google Analytics** — analytics, as described above.
- **Google Cloud** — hosting, and therefore server logs.
- **CoinGecko** — supplies the price data on [/market](/market) and the ticker.
  Price data is fetched by our servers, not your browser, so CoinGecko does not
  see your visit.

Coin icons on the market page are loaded directly from CoinGecko's asset host,
which means your browser makes a request to them for those images.

## Cookies

The only cookies set are Google Analytics'. Nothing on this site requires
cookies to function — block them and everything still works.

## Your rights

If you are in the UK, EU, or a jurisdiction with comparable law, you have the
right to access, correct or delete personal data held about you, and to object
to processing. Given how little we hold, in practice the useful remedies are
browser-level: block cookies, or use Google's
[opt-out add-on](https://tools.google.com/dlpage/gaoptout). If you want to make
a formal request anyway, email [${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}).

## Changes

If this policy changes materially, the date above changes with it.
`;

export default function PrivacyPage() {
  return (
    <StaticPage
      title="Privacy"
      accent="var(--amber)"
      intro="No accounts, no newsletter, no ads. Here is the little that is collected, and by whom."
      updated={UPDATED}
    >
      <PostBody content={CONTENT} />
    </StaticPage>
  );
}
