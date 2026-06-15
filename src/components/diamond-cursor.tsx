"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A single diamond-shaped cursor that tracks the pointer. It is pixel-locked to
 * the pointer (written directly on pointermove, so it never trails) and expands
 * with an acid tint over interactive elements. Renders only on precise pointers
 * (desktop) — touch devices keep their native behaviour.
 */
export function DiamondCursor() {
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hot, setHot] = useState(false); // over an interactive element

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

    let hotNow = false; // mirror of `hot`, avoids re-render churn

    function onMove(e: PointerEvent) {
      // Pixel-lock the cursor to the pointer immediately — no frame delay.
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) rotate(45deg)`;
      }

      // Only touch React state when the hover target type actually changes.
      const el = e.target as HTMLElement | null;
      const over = !!el?.closest("a, button, [role='button'], input, textarea");
      if (over !== hotNow) {
        hotNow = over;
        setHot(over);
      }
    }

    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  if (!enabled) return null;

  return (
    <div
      ref={ringRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] border transition-[width,height,border-color] duration-150"
      style={{
        willChange: "transform",
        width: hot ? 34 : 22,
        height: hot ? 34 : 22,
        borderColor: hot ? "var(--acid)" : "var(--cyan)",
        boxShadow: `0 0 12px -2px ${hot ? "var(--acid)" : "var(--cyan)"}`,
      }}
    />
  );
}
