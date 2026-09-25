import type { Metadata } from "next";
import { PostBody } from "@/components/post-body";
import { StaticPage } from "@/components/static-page";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description:
    "How TheCryptoDesk sources, writes, illustrates and corrects its cryptocurrency coverage — including where AI is used and where it is not.",
  alternates: { canonical: absoluteUrl("/editorial-policy") },
};

const UPDATED = "2026-09-23";

const CONTENT = `
## What we publish

${SITE_NAME} covers cryptocurrency news, market data and educational reference
material. Everything on the site falls into one of four buckets, and each is
produced differently:

- **News articles** (\`/news\`) — reports based on published third-party reporting.
- **Guides** (\`/learn\`) — evergreen explainers on how crypto works.
- **Glossary** (\`/glossary\`) — definitions of common terms, written by hand.
- **Market data** (\`/market\`) — live prices pulled directly from CoinGecko.

## Where our news comes from

We monitor the public RSS feeds of established crypto news organisations —
currently **CoinJournal**, **CryptoSlate**, **BeInCrypto**, **CryptoPotato**
and **Bitcoin Magazine**. We do not conduct original reporting, break news, or
cultivate our own sources. Every news article on this site is derived from
someone else's journalism, and every article links back to the specific piece
it was based on.

We write only from feeds that publish the full text of their articles. Some
outlets — **CoinDesk** and **Cointelegraph** among them — publish only a
headline and a one-line summary. We read those to judge what is worth
covering, but we do not write from them: a one-line summary is not enough to
report from, and filling the gap would mean inventing the rest.

If you want the original reporting, follow the source link at the bottom of any
article. We would rather send you there than have you rely on us alone.

## How articles are written

News articles and guides are **drafted by an AI system** (Google's Gemini) and
published automatically. They are **not individually reviewed by a human editor
before publication**. We think that is important to state plainly rather than
bury behind softer phrasing.

What that system is instructed to do, and what it is forbidden from doing, is
the actual editorial policy. The rules are:

- **Figures are preserved exactly.** Prices, percentages, dates, dollar amounts,
  ticker symbols and full names are carried over from the source verbatim. A
  source that says "$4.2 billion" may not become "billions"; "STRK fell 12% to
  $87" may not become "came under pressure".
- **Named entities stay named.** If the source identifies a specific exchange,
  fund, or instrument, so do we. Vagueness is treated as a failure, not a
  safe default.
- **Nothing is invented.** No fabricated quotes, prices, statistics or events.
  Where an article adds context, that context is general knowledge or reasoning
  about the source's own facts — never new specifics.
- **Analysis is labelled as analysis.** Articles carry a short "why it matters"
  section. That is interpretation and should be read as opinion, not reporting.

Rewriting applies to sentence structure and prose. It does not apply to data.

## Images

Article and guide cover images are **AI-generated illustrations**, created from
a short description of the article's subject. They are decorative. They are not
photographs, they do not depict real events, people or places, and they should
never be read as documentary evidence of anything.

## What is not AI-generated

The glossary is written and maintained by hand. Market data on \`/market\` and
the price ticker comes unmodified from CoinGecko's public API. The pages you are
reading now — this policy, about, privacy and terms — are hand-written.

## Corrections

If an article misstates a fact, contains a figure that does not match its
source, or links to the wrong place, tell us and we will fix or remove it.
Write to us via the [contact page](/contact) with the article URL and what is
wrong. Corrections to published articles are made in place.

Because our articles are derivative, an error in our coverage usually means one
of two things: the source has been misread, or the source itself was wrong and
has since been updated. We will say which.

## Not financial advice

Nothing on this site is financial, investment, legal or tax advice. We do not
know your circumstances and we are not qualified to advise on them.
Cryptocurrency is volatile and you can lose everything you put into it. Do your
own research and, for anything that matters, talk to someone regulated to
advise you.

## Independence

We do not accept payment for coverage. We do not publish sponsored posts,
paid reviews, or "partner content" dressed as editorial. If that ever changes,
it will be disclosed here and labelled on the articles themselves.
`;

export default function EditorialPolicyPage() {
  return (
    <StaticPage
      title="Editorial Policy"
      intro={`How ${SITE_NAME} sources, writes, illustrates and corrects its coverage — including exactly where AI is used, and where it is not.`}
      updated={UPDATED}
    >
      <PostBody content={CONTENT} />
    </StaticPage>
  );
}
