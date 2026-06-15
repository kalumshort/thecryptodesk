/**
 * Tiny inline SVG sparkline for a 7-day price series. Pure/deterministic, so it
 * renders fine in a server component. Colored green/red by net direction.
 */
export function Sparkline({
  data,
  width = 96,
  height = 28,
}: {
  data: number[];
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return <span className="text-muted-foreground">—</span>;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  const up = data[data.length - 1] >= data[0];
  const color = up ? "var(--acid)" : "var(--magenta)";

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      aria-hidden
      className="overflow-visible"
    >
      <polyline
        points={points}
        stroke={color}
        strokeWidth={1.5}
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ filter: `drop-shadow(0 0 3px ${color})` }}
      />
    </svg>
  );
}
