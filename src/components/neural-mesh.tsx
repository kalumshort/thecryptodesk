"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  phase: number; // pulse offset
  hue: number; // 0..1 → cyan↔violet, rare acid
}

const PIGMENTS = {
  cyan: [34, 224, 255] as const,
  violet: [176, 107, 255] as const,
  acid: [182, 255, 60] as const,
};

function lerpColor(a: readonly number[], b: readonly number[], t: number) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

/**
 * Full-viewport animated neural mesh: nodes drift, pulse and link to nearby
 * neighbours like a living mycelial network. Reacts subtly to the cursor.
 */
export function NeuralMesh() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let nodes: Node[] = [];
    const mouse = { x: -9999, y: -9999 };
    const LINK_DIST = 150;

    const seed = () => {
      const count = Math.min(120, Math.floor((width * height) / 16000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random(),
      }));
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      cv.width = width * dpr;
      cv.height = height * dpr;
      cv.style.width = `${width}px`;
      cv.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    };

    const nodeColor = (n: Node) => {
      // mostly cyan↔violet, occasional acid-green spore
      if (n.hue > 0.92) return PIGMENTS.acid;
      return lerpColor(PIGMENTS.cyan, PIGMENTS.violet, n.hue);
    };

    let raf = 0;
    let t = 0;

    const frame = () => {
      t += 0.016;
      ctx.clearRect(0, 0, width, height);

      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        // gentle drift toward the cursor when nearby
        const dxm = mouse.x - n.x;
        const dym = mouse.y - n.y;
        if (dxm * dxm + dym * dym < 200 * 200) {
          n.x += dxm * 0.0008;
          n.y += dym * 0.0008;
        }
      }

      // synaptic links
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dist = Math.hypot(a.x - b.x, a.y - b.y);
          if (dist < LINK_DIST) {
            const c = lerpColor(nodeColor(a), nodeColor(b), 0.5);
            const alpha = (1 - dist / LINK_DIST) * 0.28;
            ctx.strokeStyle = `rgba(${c[0]},${c[1]},${c[2]},${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // pulsing nodes
      for (const n of nodes) {
        const pulse = 0.5 + 0.5 * Math.sin(t * 1.6 + n.phase);
        const r = 1.2 + pulse * 1.8;
        const [cr, cg, cb] = nodeColor(n);
        ctx.beginPath();
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${cr},${cg},${cb},${0.5 + pulse * 0.5})`;
        ctx.shadowBlur = 10 + pulse * 10;
        ctx.shadowColor = `rgba(${cr},${cg},${cb},0.9)`;
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      if (!reduced) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseout", onLeave);

    if (reduced) {
      frame(); // single static render
    } else {
      raf = requestAnimationFrame(frame);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 opacity-70"
    />
  );
}
