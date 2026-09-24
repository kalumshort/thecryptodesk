import type { Metadata } from "next";
import { PostBody } from "@/components/post-body";
import { StaticPage } from "@/components/static-page";
import { CONTACT_EMAIL, SITE_NAME, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: `The terms covering use of ${SITE_NAME}, including the financial-advice disclaimer and limits on accuracy.`,
  alternates: { canonical: absoluteUrl("/terms") },
};

const UPDATED = "2026-09-23";

const CONTENT = `
By using ${SITE_NAME} you accept these terms. They are deliberately short.

## Not financial advice

**Nothing on this site is financial, investment, legal or tax advice.** We are
not a broker, adviser, or regulated financial institution, and no content here
is a recommendation to buy, sell or hold anything.

Cryptocurrency is highly volatile and largely unregulated. You can lose all of
the money you put into it. Any decision you make after reading this site is
yours alone, and you make it at your own risk. For anything that matters,
consult someone qualified and regulated to advise you in your jurisdiction.

## Accuracy, and its limits

We summarise other publications' reporting, and our articles are drafted
automatically. Both of those things introduce risk. We take accuracy seriously —
the constraints we work under are set out in the
[editorial policy](/editorial-policy) — but we do not warrant that any article
is complete, current or free of error, and we do not independently verify the
reporting we summarise.

**Always check the source.** Every article links to the original. Where our
summary and the source disagree, the source is authoritative.

Market data is supplied by CoinGecko and passed through unmodified. It may be
delayed, incomplete or wrong, and we have no control over it. Do not trade on
the numbers shown here.

## Content and copyright

Original text, design and code on this site belong to ${SITE_NAME}. Article
summaries derive from third-party reporting, which remains the property of the
publications that produced it, and is credited and linked on every article.
Cover images are AI-generated illustrations. Coin data and icons belong to
CoinGecko.

If you are a rights holder with a concern about any article, email
[${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL}) and we will remove it. See the
[contact page](/contact).

## Availability

The site is provided as-is, with no guarantee of uptime, and may change or
disappear without notice.

## Liability

To the fullest extent permitted by law, ${SITE_NAME} is not liable for any loss
arising from your use of, or reliance on, this site — including trading losses.
Nothing here limits liability where it cannot lawfully be limited.

## Changes

Continued use after these terms change means you accept the revised version.
The date above reflects the last revision.
`;

export default function TermsPage() {
  return (
    <StaticPage
      title="Terms"
      accent="var(--magenta)"
      intro="The terms covering use of this site, including the financial-advice disclaimer."
      updated={UPDATED}
    >
      <PostBody content={CONTENT} />
    </StaticPage>
  );
}
