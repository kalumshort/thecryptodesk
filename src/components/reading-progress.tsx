"use client";

import { useEffect, useState } from "react";

/**
 * A thin progress bar under the header showing how far through the article
 * the reader is.
 *
 * Sits at the top of the article rather than fixed to the viewport, so it
 * never covers content on short screens. Gated on `prefers-reduced-motion`
 * only for the transition, not the bar itself — the bar is information, not
 * decoration.
 */
export function ReadingProgress() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - window.innerHeight;
      if (scrollable <= 0) {
        setPct(0);
        return;
      }
      const ratio = window.scrollY / scrollable;
      setPct(Math.min(100, Math.max(0, ratio * 100)));
    };

    // Coalesce scroll events into one measurement per frame.
    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className="sticky top-0 z-40 h-[3px] w-full bg-raised"
      role="progressbar"
      aria-label="Article reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
    >
      <div
        className="h-[3px] bg-gradient-to-r from-cyan to-violet"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
