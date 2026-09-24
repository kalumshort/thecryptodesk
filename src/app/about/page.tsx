import type { Metadata } from "next";
import { PostBody } from "@/components/post-body";
import { StaticPage } from "@/components/static-page";
import { SITE_NAME, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About",
  description: `What ${SITE_NAME} is, what it covers, and how it is put together.`,
  alternates: { canonical: absoluteUrl("/about") },
};

const CONTENT = `
## What this is

${SITE_NAME} is a cryptocurrency news and reference site. It pulls together
three things that are usually scattered across half a dozen tabs:

- **What just happened** — a running feed of crypto news, summarised from
  established industry reporting and organised by topic.
- **What things are worth** — live prices, market cap, dominance and sentiment,
  on [/market](/market), refreshed every minute.
- **What any of it means** — a [glossary](/glossary) of the terms that trip
  newcomers up, and a set of [guides](/learn) that explain the mechanics from
  first principles.

## Who it is for

People who want to keep up with crypto without reading twelve outlets, and
people who are new enough that half the vocabulary is still opaque. The guides
and glossary assume no prior knowledge. The news assumes you can read a
percentage.

## How it is made

News articles are summarised from the public feeds of established crypto
publications and always link back to the original reporting. Drafting is
automated — an AI system does the writing, working from the source article
under a fixed set of rules about what it may and may not change.

We are specific about this rather than vague, because the limits matter: we do
not do original reporting, and our articles are only as good as the journalism
they are based on. The [editorial policy](/editorial-policy) sets out exactly
what is automated, what is hand-written, what the AI is forbidden from doing,
and how to get something corrected.

## What this is not

Not a trading platform, not a signal service, not an investment adviser. We
publish no price predictions and no buy or sell recommendations. Nothing here
is financial advice — see the [terms](/terms) for the full disclaimer.

## Getting in touch

Corrections, questions and complaints all go to the same place: the
[contact page](/contact).
`;

export default function AboutPage() {
  return (
    <StaticPage
      title="About"
      accent="var(--violet)"
      intro={`${SITE_NAME} is a crypto news, price and reference site. Here is what it covers and how it is put together.`}
    >
      <PostBody content={CONTENT} />
    </StaticPage>
  );
}
