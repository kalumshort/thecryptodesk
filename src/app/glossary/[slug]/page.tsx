import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostBody } from "@/components/post-body";
import { GLOSSARY, getTerm } from "@/lib/glossary";
import { absoluteUrl, SITE_NAME } from "@/lib/seo";

type Params = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GLOSSARY.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const term = getTerm(slug);
  if (!term) return { title: "Not found" };
  return {
    title: `${term.term} — Crypto Glossary`,
    description: term.short,
    alternates: { canonical: absoluteUrl(`/glossary/${term.slug}`) },
  };
}

export default async function GlossaryTermPage({ params }: Params) {
  const { slug } = await params;
  const term = getTerm(slug);
  if (!term) notFound();

  const related = (term.related ?? [])
    .map((s) => getTerm(s))
    .filter((t): t is NonNullable<typeof t> => Boolean(t));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: term.term,
    description: term.short,
    inDefinedTermSet: absoluteUrl("/glossary"),
    url: absoluteUrl(`/glossary/${term.slug}`),
    publisher: { "@type": "Organization", name: SITE_NAME },
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link
        href="/glossary"
        className="text-[10px] uppercase tracking-widest text-muted-foreground transition-colors hover:text-cyan"
      >
        ← Glossary
      </Link>

      <h1 className="mt-3 mb-2 font-display text-3xl font-extrabold uppercase tracking-wide text-cyan text-glow-cyan">
        {term.term}
      </h1>
      <p className="mb-8 text-sm leading-relaxed text-muted-foreground">
        {term.short}
      </p>

      <PostBody content={term.definition} />

      {related.length > 0 ? (
        <div className="mt-12 border-t border-cyan/15 pt-6">
          <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-[0.3em] text-violet text-glow-violet">
            ◆ Related terms
          </h2>
          <div className="flex flex-wrap gap-2">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/glossary/${r.slug}`}
                className="rounded-sm border border-violet/40 px-2.5 py-1 text-[11px] uppercase tracking-widest text-violet transition-all hover:border-violet hover:[text-shadow:0_0_10px_var(--violet)]"
              >
                {r.term}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
