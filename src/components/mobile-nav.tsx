"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import type { NavLink } from "@/components/site-header";

// Static hover-glow classes per accent. Kept as a lookup (not interpolated)
// so Tailwind can see every class name at build time.
const ACCENT_HOVER: Record<NavLink["accent"], string> = {
  acid: "hover:text-acid hover:[text-shadow:0_0_10px_var(--acid)]",
  cyan: "hover:text-cyan hover:[text-shadow:0_0_10px_var(--cyan)]",
  amber: "hover:text-amber hover:[text-shadow:0_0_10px_var(--amber)]",
  violet: "hover:text-violet hover:[text-shadow:0_0_10px_var(--violet)]",
};

/**
 * Mobile-only nav: a hamburger button that opens a slide-in drawer from the
 * right with a dimmed overlay. Hidden at `md` and up, where the header shows
 * its normal horizontal nav instead.
 */
export function MobileNav({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  // Close on Escape and lock background scroll while the drawer is open.
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-cyan"
      >
        <Menu className="h-6 w-6" />
      </button>

      {open && typeof document !== "undefined"
        ? createPortal(
            <>
              <div
                aria-hidden
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              />
              <div
                role="dialog"
                aria-modal="true"
                aria-label="Site navigation"
                className="fixed right-0 top-0 z-50 flex h-full w-72 max-w-[80vw] flex-col panel border-y-0 border-r-0"
              >
                <div className="flex items-center justify-between px-4 py-3">
                  <span className="font-display text-xs font-bold uppercase tracking-[0.3em] text-cyan text-glow-cyan">
                    ◆ Menu
                  </span>
                  <button
                    type="button"
                    aria-label="Close menu"
                    onClick={() => setOpen(false)}
                    className="rounded-sm p-1.5 text-muted-foreground transition-colors hover:text-magenta"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <nav className="flex flex-col overflow-y-auto px-2 pb-6">
                  {links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`rounded-sm px-3 py-3 text-sm font-bold uppercase tracking-widest text-muted-foreground transition-all ${ACCENT_HOVER[link.accent]}`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
              </div>
            </>,
            document.body,
          )
        : null}
    </div>
  );
}
