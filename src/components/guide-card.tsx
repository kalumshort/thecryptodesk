import Link from "next/link";
import { LEVEL_COLOR, LEVEL_LABELS, type Guide } from "@/types/guide";

/** Learn-hub card: a guide preview linking to its detail page, accented by level. */
export function GuideCard({ guide }: { guide: Guide }) {
  const accent = LEVEL_COLOR[guide.level];

  return (
    <article
      className="group relative flex h-full flex-col overflow-hidden rounded-md panel transition-all duration-300 hover:-translate-y-1"
      style={{ ["--accent" as string]: accent }}
    >
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px opacity-40 transition-opacity group-hover:opacity-100"
        style={{ background: accent, boxShadow: `0 0 14px ${accent}` }}
      />
      <Link href={`/learn/${guide.slug}`} className="block overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={guide.coverImage || "/placeholder-cover.svg"}
          alt=""
          loading="lazy"
          className="aspect-[16/9] w-full object-cover opacity-80 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-3 text-[10px] uppercase tracking-widest">
          <span
            className="font-display font-bold"
            style={{ color: accent, textShadow: `0 0 10px ${accent}` }}
          >
            {LEVEL_LABELS[guide.level]}
          </span>
          <span className="text-muted-foreground">
            {guide.readingTimeMinutes}m read
          </span>
        </div>
        <h3 className="line-clamp-2 font-display text-sm font-bold leading-snug tracking-wide text-foreground transition-colors group-hover:text-cyan">
          <Link href={`/learn/${guide.slug}`}>{guide.title}</Link>
        </h3>
        <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">
          {guide.excerpt}
        </p>
      </div>
    </article>
  );
}
