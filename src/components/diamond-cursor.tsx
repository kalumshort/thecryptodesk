"use client";

import { useEffect, useRef, useState } from "react";

/**
 * A diamond-shaped cursor that tracks the pointer. The solid core is pixel-locked
 * to the pointer (written directly on pointermove, so it never trails); an outer
 * ring lags with easing for a bio-digital trail. Renders only on precise pointers
 * (desktop) — touch devices keep their native behaviour.
 */
export function DiamondCursor() {
  const coreRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const [enabled, setEnabled] = useState(false);
  const [hot, setHot] = useState(false); // over an interactive element

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    if (!fine) return;
    setEnabled(true);

    const target = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const ring = { x: target.x, y: target.y };
    let hotNow = false; // ref-like mirror of `hot`, avoids re-render churn
    let raf = 0;

    function onMove(e: PointerEvent) {
      target.x = e.clientX;
      target.y = e.clientY;

      // Pixel-lock the core to the pointer immediately — no frame delay.
      if (coreRef.current) {
        coreRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%) rotate(45deg)`;
      }

      // Only touch React state when the hover target type actually changes.
      const el = e.target as HTMLElement | null;
      const over = !!el?.closest("a, button, [role='button'], input, textarea");
      if (over !== hotNow) {
        hotNow = over;
        setHot(over);
      }
    }

    function loop() {
      // ring eases toward target (the intentional trailing element)
      ring.x += (target.x - ring.x) * 0.18;
      ring.y += (target.y - ring.y) * 0.18;
      if (ringRef.current) {
        ringRef.current.style.transform = `translate(${ring.x}px, ${ring.y}px) translate(-50%, -50%) rotate(45deg)`;
      }
      raf = requestAnimationFrame(loop);
    }

    window.addEventListener("pointermove", onMove);
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  if (!enabled) return null;

  return (
    <>
      {/* Solid core diamond */}
      <div
        ref={coreRef}
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 bg-cyan"
        style={{
          willChange: "transform",
          boxShadow:
            "0 0 8px var(--cyan), 0 0 16px color-mix(in oklch, var(--cyan) 60%, transparent)",
        }}
      />
      {/* Lagging outer ring — expands over interactive targets */}
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
    </>
  );
}
