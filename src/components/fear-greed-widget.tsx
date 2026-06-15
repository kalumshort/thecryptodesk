import { getFearGreed, fearGreedColor } from "@/lib/sentiment";

const R = 40;
const ARC_LENGTH = Math.PI * R; // length of the top semicircle path

/**
 * Sidebar sentiment gauge: a semicircular dial showing the Crypto Fear & Greed
 * Index (0–100) with a value-colored fill. Async server component; renders
 * nothing if the feed is unavailable.
 */
export async function FearGreedWidget() {
  const fng = await getFearGreed();
  if (!fng) return null;

  const color = fearGreedColor(fng.value);
  const fill = (Math.max(0, Math.min(100, fng.value)) / 100) * ARC_LENGTH;

  return (
    <div className="rounded-md panel p-5">
      <h2 className="mb-4 font-display text-xs font-bold uppercase tracking-[0.3em] text-acid [text-shadow:0_0_10px_var(--acid)]">
        ◆ Fear &amp; Greed
      </h2>
      <div className="flex flex-col items-center">
        <svg viewBox="0 0 100 56" className="w-full max-w-[180px]">
          {/* track */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke="color-mix(in oklch, var(--cyan) 12%, transparent)"
            strokeWidth={8}
            strokeLinecap="round"
          />
          {/* value fill */}
          <path
            d="M 10 50 A 40 40 0 0 1 90 50"
            fill="none"
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            strokeDasharray={`${fill} ${ARC_LENGTH}`}
            style={{ filter: `drop-shadow(0 0 4px ${color})` }}
          />
          <text
            x="50"
            y="46"
            textAnchor="middle"
            className="font-display"
            fontSize="20"
            fontWeight="700"
            fill={color}
          >
            {fng.value}
          </text>
        </svg>
        <div
          className="mt-1 text-center text-xs font-bold uppercase tracking-widest"
          style={{ color }}
        >
          {fng.classification}
        </div>
      </div>
    </div>
  );
}
