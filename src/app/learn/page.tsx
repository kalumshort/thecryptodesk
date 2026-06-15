import type { Metadata } from "next";
import { GuideCard } from "@/components/guide-card";
import { SectionHeading } from "@/components/section-heading";
import { getGuides } from "@/lib/guides";
import { absoluteUrl } from "@/lib/seo";
import { LEVELS, LEVEL_COLOR, LEVEL_LABELS } from "@/types/guide";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Learn Crypto",
  description:
    "Beginner-friendly crypto tutorials and guides. Learn how wallets, blockchains, DeFi and security work — from the basics up.",
  alternates: { canonical: absoluteUrl("/learn") },
};

export default async function LearnPage() {
  const guides = await getGuides();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-3 flex items-center gap-4">
        <h1 className="font-display text-2xl font-extrabold uppercase tracking-[0.25em] text-acid [text-shadow:0_0_16px_var(--acid)]">
          ◆ Learn
        </h1>
        <span className="h-px flex-1 bg-gradient-to-r from-acid to-transparent" />
      </div>
      <p className="mb-10 max-w-2xl text-sm leading-relaxed text-muted-foreground">
        New to crypto? These plain-English guides take you from the absolute
        basics to confident first steps — no prior knowledge needed. Work
        through them in order, or jump to what you need.
      </p>

      {guides.length === 0 ? (
        <p className="text-sm uppercase tracking-widest text-muted-foreground">
          Guides are being prepared. Check back soon.
        </p>
      ) : (
        <div className="flex flex-col gap-12">
          {LEVELS.map((level) => {
            const inLevel = guides.filter((g) => g.level === level);
            if (inLevel.length === 0) return null;
            return (
              <section key={level}>
                <SectionHeading
                  label={LEVEL_LABELS[level]}
                  accent={LEVEL_COLOR[level]}
                />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {inLevel.map((guide) => (
                    <GuideCard key={guide.slug} guide={guide} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
