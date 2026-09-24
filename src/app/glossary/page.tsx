import type { Metadata } from "next";
import { GlossaryList } from "@/components/glossary-list";
import { sortedTerms } from "@/lib/glossary";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  defaultOgImages,
  organizationId,
} from "@/lib/seo";
import { Diamond } from "@/components/diamond";
import { Breadcrumbs } from "@/components/breadcrumbs";

export const metadata: Metadata = {
  title: "Crypto Glossary",
  description:
    "Plain-English definitions of the crypto terms newcomers need — blockchain, wallets, private keys, DeFi, staking, gas, NFTs and more.",
  alternates: { canonical: absoluteUrl("/glossary") },
  openGraph: {
    type: "website",
    url: absoluteUrl("/glossary"),
    title: "Crypto Glossary",
    images: defaultOgImages(),
  },
};

export default function GlossaryPage() {
  const terms = sortedTerms();

  // The set node each /glossary/[slug] DefinedTerm points back at via
  // `inDefinedTermSet` — previously that reference resolved to nothing.
  const termSetJsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${absoluteUrl("/glossary")}#termset`,
    name: "Crypto Glossary",
    description:
      "Plain-English definitions of common cryptocurrency and blockchain terms.",
    url: absoluteUrl("/glossary"),
    publisher: { "@id": organizationId() },
    hasDefinedTerm: terms.map((t) => ({
      "@type": "DefinedTerm",
      name: t.term,
      description: t.short,
      url: absoluteUrl(`/glossary/${t.slug}`),
    })),
  };

  const crumbs = [
    { name: "Home", path: "/" },
    { name: "Glossary", path: "/glossary" },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(termSetJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd(crumbs)),
        }}
      />
      <Breadcrumbs items={crumbs} />
      <div className="mb-3 flex items-center gap-4">
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-[0.25em] text-amber [text-shadow:0_0_16px_var(--amber)]">
          <Diamond className="mr-1.5" />
          Glossary
        </h1>
        <span className="h-px flex-1 bg-gradient-to-r from-amber to-transparent" />
      </div>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        New to crypto? Start here. Plain-English definitions of the words you’ll
        run into across the site — no jargon, no assumptions.
      </p>

      <GlossaryList terms={terms} />
    </div>
  );
}
