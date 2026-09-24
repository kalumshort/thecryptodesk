import type { Metadata } from "next";
import { PostBody } from "@/components/post-body";
import { StaticPage } from "@/components/static-page";
import { CONTACT_EMAIL, SITE_NAME, absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Contact",
  description: `How to reach ${SITE_NAME} — corrections, questions, takedown requests and press.`,
  alternates: { canonical: absoluteUrl("/contact") },
};

const CONTENT = `
Email is the only channel, and it reaches a person.

**[${CONTACT_EMAIL}](mailto:${CONTACT_EMAIL})**

## Corrections

The fastest way to get something fixed. Include the **article URL** and **what
is wrong** — ideally with the figure or claim as it appears in the original
source. Corrections are made in place; see the
[editorial policy](/editorial-policy) for how we handle them.

## If you are a publisher

If you are a rights holder and believe an article draws too heavily on your
work, or you would prefer we did not summarise your feed at all, email us and
we will remove the articles and stop ingesting the source. You do not need to
send a formal notice first.

## Everything else

Questions about the site, the guides, or how any of it works are welcome. We
cannot answer questions about what to buy, what to sell, or what any asset will
do next — see the [terms](/terms).
`;

export default function ContactPage() {
  return (
    <StaticPage
      title="Contact"
      accent="var(--acid)"
      intro="Corrections, questions, takedown requests and press."
    >
      <PostBody content={CONTENT} />
    </StaticPage>
  );
}
