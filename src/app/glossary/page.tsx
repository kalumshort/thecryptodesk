import type { Metadata } from "next";
import { GlossaryList } from "@/components/glossary-list";
import { sortedTerms } from "@/lib/glossary";
import { absoluteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Crypto Glossary",
  description:
    "Plain-English definitions of the crypto terms newcomers need — blockchain, wallets, private keys, DeFi, staking, gas, NFTs and more.",
  alternates: { canonical: absoluteUrl("/glossary") },
};

export default function GlossaryPage() {
  const terms = sortedTerms();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <div className="mb-3 flex items-center gap-4">
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-[0.25em] text-amber [text-shadow:0_0_16px_var(--amber)]">
          ◆ Glossary
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
