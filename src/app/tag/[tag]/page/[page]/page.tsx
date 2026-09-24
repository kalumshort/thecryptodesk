import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TagListing, decodeTag, tagMetadata } from "@/components/tag-listing";

export const revalidate = 300;
export const dynamicParams = true;

// Tag pagination is entirely on-demand — see the note on the parent route.
export async function generateStaticParams() {
  return [];
}

type Params = { params: Promise<{ tag: string; page: string }> };

/** Reject anything that isn't a plain integer ≥ 2. */
function parsePage(raw: string): number | null {
  if (!/^[1-9][0-9]*$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 2 ? n : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag, page } = await params;
  const n = parsePage(page);
  if (n === null) return { title: "Not found" };
  return tagMetadata(decodeTag(tag), n);
}

export default async function TagPagedPage({ params }: Params) {
  const { tag, page } = await params;
  const n = parsePage(page);
  if (n === null) notFound();
  return <TagListing label={decodeTag(tag)} page={n} />;
}
