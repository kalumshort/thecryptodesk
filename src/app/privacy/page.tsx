import type { Metadata } from "next";
import { PostBody } from "@/components/post-body";
import { StaticPage } from "@/components/static-page";
import { CONTACT_EMAIL, SITE_NAME, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `What data ${SITE_NAME} collects, what it does not, and who it is shared with.`,
  alternates: { canonical: absoluteUrl("/privacy") },
};

const UPDATED = "2026-09-26";

const CONTENT = `
The short version: we have no accounts, no logins, no newsletter and no
comments, so there is very little about you for us to hold. The one thing you
can hand us is a message through the [contact form](/contact).

## What we collect

**Analytics.** We use Google Analytics 4 to count visits and see which articles
people read. It sets cookies and records things like the pages you view, roughly
where in the world you are, and what kind of device and browser you used. IP
addresses are anonymised by Google before we see anything. We look at this in
aggregate; we are not trying to identify you and have no way to do so.

**Server logs.** Our host (Google Cloud) keeps standard request logs, including
IP addresses, for operational and security purposes.

**Contact form submissions.** If you write to us, we store what you sent — your
name, email address, chosen topic and message — so that we have a record of it
and can reply. We also store a one-way hash of your IP address, which is used
only to rate-limit the form; the address itself is never written down. We keep
submissions for as long as the matter is open and routinely delete old ones.
We use your email address to answer you and for nothing else: no list, no
marketing, and it is never passed on.

That is the complete list. We do not run advertising, and there are no
third-party ad or tracking pixels on this site.

## What we do not collect

We never ask for payment details, because there is nothing here to buy, and we
ask for your name and email address only if you choose to write to us — nothing
on this site requires either in order to read it. We do not sell data, because
we do not have any worth selling. We do not build profiles of visitors, and a
message you send is not linked to your browsing.

## Third parties

Four external services are involved in serving this site:

- **Google Analytics** — analytics, as described above.
- **Google Cloud** — hosting, and therefore server logs.
- **CoinGecko** — supplies the price data on [/market](/market) and the ticker.
  Price data is fetched by our servers, not your browser, so CoinGecko does not
  see your visit.
- **Resend** — delivers contact-form submissions to our mailbox. A message you
  send passes through them in transit.

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
