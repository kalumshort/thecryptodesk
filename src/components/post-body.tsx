import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

/** Internal post links get client-side nav; external links open in a new tab. */
function Anchor({ href = "", children, ...rest }: ComponentPropsWithoutRef<"a">) {
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...rest}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" {...rest}>
      {children}
    </a>
  );
}

/** Renders AI-rewritten Markdown content as styled article HTML. */
export function PostBody({ content }: { content: string }) {
  return (
    <div
      className="prose prose-invert max-w-none leading-relaxed
        prose-headings:font-[var(--font-orbitron)] prose-headings:tracking-wide prose-headings:text-cyan
        prose-p:text-foreground/90
        prose-strong:text-cyan
        prose-a:text-cyan prose-a:no-underline hover:prose-a:[text-shadow:0_0_10px_var(--cyan)]
        prose-li:text-foreground/90 prose-li:marker:text-violet
        prose-blockquote:border-l-violet prose-blockquote:text-muted-foreground
        prose-code:text-acid prose-code:before:content-none prose-code:after:content-none
        prose-hr:border-cyan/20"
    >
      <Markdown remarkPlugins={[remarkGfm]} components={{ a: Anchor }}>
        {content}
      </Markdown>
    </div>
  );
}
