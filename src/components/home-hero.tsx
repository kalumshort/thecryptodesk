import Image from "next/image";
import Link from "next/link";
import { formatDate } from "@/lib/format";
import { CATEGORY_COLOR } from "@/lib/category-style";
import { CATEGORY_LABELS, type Post } from "@/types/post";

/**
 * The homepage lead.
 *
 * Two treatments, chosen by whether the lead story actually has a cover:
 *
 * - with an image: the cover runs full-bleed behind the headline, scrimmed.
 * - without one: a purely typographic lead at a larger size.
 *
 * Roughly half of ingested posts have no cover, and the old hero put the
 * placeholder graphic at the largest size on the page. The fallback is the
 * design working with the data rather than against it.
 */
export function HomeHero({ lead, rail }: { lead: Post; rail: Post[] }) {
  const accent = CATEGORY_COLOR[lead.category];
  const hasCover = Boolean(lead.coverImage);

  return (
    <section className="mb-10 overflow-hidden rounded-md panel lg:flex">
      <div className="relative min-w-0 flex-1">
        {hasCover ? (
          <>
            <Image
              src={lead.coverImage}
              alt=""
              fill
              sizes="(max-width: 1023px) 100vw, 760px"
              preload
              className="object-cover"
            />
            {/* Scrim: the headline sits on this, not on the raw photo. */}
            <span
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-void via-void/70 to-void/5"
            />
          </>
        ) : null}

        <div
          className={`relative flex flex-col justify-end gap-4 p-7 sm:p-9 ${
            hasCover ? "min-h-[380px] lg:min-h-[468px]" : "min-h-[300px]"
          }`}
        >
          <div className="flex flex-wrap items-center gap-3 font-mono text-[11px] uppercase tracking-widest">
            <span
              className="rounded-sm px-2 py-1 font-bold text-void"
              style={{ background: accent }}
            >
              {CATEGORY_LABELS[lead.category]}
            </span>
            <time dateTime={lead.publishedAt} className="text-muted-foreground">
              {formatDate(lead.publishedAt)}
            </time>
            <span className="text-text-low">
              {lead.readingTimeMinutes}m read
            </span>
          </div>

          <h1
            className={`font-display font-bold leading-[1.08] tracking-[-0.032em] text-foreground ${
              hasCover
                ? "max-w-[620px] text-3xl sm:text-[42px]"
                : "max-w-[900px] text-4xl sm:text-[54px] sm:leading-[1.04]"
            }`}
          >
            <Link
              href={`/news/${lead.slug}`}
              className="transition-colors hover:text-cyan"
            >
              {lead.title}
            </Link>
          </h1>

          <p className="max-w-[560px] font-[var(--font-body)] text-[17px] leading-relaxed text-foreground/80">
            {lead.excerpt}
          </p>
        </div>
      </div>

      {rail.length > 0 ? (
        <div className="flex shrink-0 flex-col border-t border-border bg-card lg:w-[396px] lg:border-l lg:border-t-0">
          <h2 className="border-b border-border px-5 py-4 font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-text-low">
            More headlines
          </h2>
          {rail.map((post) => (
            <Link
              key={post.slug}
              href={`/news/${post.slug}`}
              className="group flex flex-1 gap-3.5 border-b border-border px-5 py-4 transition-colors last:border-b-0 hover:bg-cyan/5"
            >
              <span className="relative size-[60px] shrink-0 overflow-hidden rounded-sm bg-raised">
                <Image
                  src={post.coverImage || "/placeholder-cover.svg"}
                  alt=""
                  fill
                  sizes="60px"
                  className="object-cover"
                />
              </span>
              <span className="flex min-w-0 flex-col gap-1.5">
                <span
                  className="font-mono text-[10px] uppercase tracking-widest"
                  style={{ color: CATEGORY_COLOR[post.category] }}
                >
                  {CATEGORY_LABELS[post.category]}
                </span>
                <span className="line-clamp-3 font-display text-[15px] font-semibold leading-snug text-foreground transition-colors group-hover:text-cyan">
                  {post.title}
                </span>
              </span>
            </Link>
          ))}
        </div>
      ) : null}
    </section>
  );
}
