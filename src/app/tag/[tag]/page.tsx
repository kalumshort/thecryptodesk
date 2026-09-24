import type { Metadata } from "next";
import { TagListing, decodeTag, tagMetadata } from "@/components/tag-listing";

export const revalidate = 300;
// Tags are open-ended, so render on demand rather than pre-building a fixed set.
export const dynamicParams = true;

// Required for on-demand paths to be ISR-cached at runtime: a route with
// `dynamicParams` but no `generateStaticParams` at all re-renders on EVERY
// request instead of caching. Returning an empty array opts in without
// pre-building anything at deploy time.
export async function generateStaticParams() {
  return [];
}

type Params = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { tag } = await params;
  return tagMetadata(decodeTag(tag), 1);
}

export default async function TagPage({ params }: Params) {
  const { tag } = await params;
  return <TagListing label={decodeTag(tag)} page={1} />;
}
