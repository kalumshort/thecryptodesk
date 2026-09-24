import Link from "next/link";
import { getGuides } from "@/lib/guides";
import { LEVEL_COLOR, LEVEL_LABELS } from "@/types/guide";

/**
 * Homepage footer strip pointing into the Learn hub.
 *
 * The guides are the part of the site that is not a summary of someone else's
 * reporting, so they get a standing entry point from the homepage rather than
 * living only behind a nav link.
 */
export async function GuideStrip({ limit = 3 }: { limit?: number }) {
  const guides = await getGuides();
  if (guides.length === 0) return null;

  // One per level where possible, so the strip shows the spread of the hub.
  const byLevel = new Map<string, (typeof guides)[number]>();
  for (const guide of guides) {
    if (!byLevel.has(guide.level)) byLevel.set(guide.level, guide);
  }
  const picked = [...byLevel.values(), ...guides]
    .filter((g, i, all) => all.findIndex((x) => x.slug === g.slug) === i)
    .slice(0, limit);

  return (
    <section className="mt-14 rounded-md panel p-6 sm:p-7">
      <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:gap-9">
        <div className="lg:w-[250px] lg:shrink-0">
          <h2 className="font-display text-xl font-bold tracking-[-0.02em] text-foreground">
            New to crypto?
          </h2>
          <p className="mt-2 font-[var(--font-body)] text-[15px] leading-relaxed text-muted-foreground">
            Plain-English guides that explain the mechanics behind the
            headlines.
          </p>
          <Link
            href="/learn"
            className="mt-3 inline-block font-mono text-[11px] uppercase tracking-widest text-cyan"
          >
            Start learning
          </Link>
        </div>
        <ul className="grid flex-1 gap-3.5 sm:grid-cols-3">
          {picked.map((guide) => (
            <li key={guide.slug}>
              <Link
                href={`/learn/${guide.slug}`}
                className="group flex h-full flex-col gap-2 rounded-sm border border-border p-4 transition-colors hover:border-cyan/40 hover:bg-cyan/5"
              >
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: LEVEL_COLOR[guide.level] }}
                >
                  {LEVEL_LABELS[guide.level]}
                </span>
                <span className="font-display text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-cyan">
                  {guide.title}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
