import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArchiveListing,
  archiveMetadata,
  parseMonth,
} from "@/components/archive-listing";
import { getArchiveIndex } from "@/lib/posts";

export const revalidate = 3600;
export const dynamicParams = true;

type Params = { params: Promise<{ year: string; month: string }> };

export async function generateStaticParams() {
  const entries = await getArchiveIndex();
  return entries.map((e) => ({
    year: String(e.year),
    month: String(e.month).padStart(2, "0"),
  }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { year, month } = await params;
  const parsed = parseMonth(year, month);
  if (!parsed) return { title: "Not found" };
  return archiveMetadata(parsed.y, parsed.m, 1);
}

export default async function ArchiveMonthPage({ params }: Params) {
  const { year, month } = await params;
  const parsed = parseMonth(year, month);
  if (!parsed) notFound();
  return <ArchiveListing y={parsed.y} m={parsed.m} page={1} />;
}
