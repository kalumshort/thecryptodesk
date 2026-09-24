import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CategoryListing,
  categoryMetadata,
} from "@/components/category-listing";
import { CATEGORIES, isCategory } from "@/types/post";

export const revalidate = 300;

type Params = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return CATEGORIES.map((category) => ({ category }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { category } = await params;
  if (!isCategory(category)) return { title: "Not found" };
  return categoryMetadata(category, 1);
}

export default async function CategoryPage({ params }: Params) {
  const { category } = await params;
  if (!isCategory(category)) notFound();
  return <CategoryListing category={category} page={1} />;
}
