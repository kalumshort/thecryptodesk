import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ArchiveListing,
  archiveMetadata,
  parseMonth,
} from "@/components/archive-listing";

export const revalidate = 3600;
export const dynamicParams = true;

// Archive months rarely run past one page, so these render on demand rather
// than multiplying the build's static params by every historical month.
export async function generateStaticParams() {
  return [];
}

type Params = {
  params: Promise<{ year: string; month: string; page: string }>;
};

/** Reject anything that isn't a plain integer ≥ 2. */
function parsePage(raw: string): number | null {
  if (!/^[1-9][0-9]*$/.test(raw)) return null;
  const n = Number(raw);
  return n >= 2 ? n : null;
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { year, month, page } = await params;
  const parsed = parseMonth(year, month);
  const n = parsePage(page);
  if (!parsed || n === null) return { title: "Not found" };
  return archiveMetadata(parsed.y, parsed.m, n);
}

export default async function ArchiveMonthPagedPage({ params }: Params) {
  const { year, month, page } = await params;
  const parsed = parseMonth(year, month);
  const n = parsePage(page);
  if (!parsed || n === null) notFound();
  return <ArchiveListing y={parsed.y} m={parsed.m} page={n} />;
}
