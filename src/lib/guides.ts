import "server-only";
import type {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { LEVEL_RANK, type Guide, type Level } from "@/types/guide";

const GUIDES = "guides";

function toIso(value: unknown): string {
  if (value && typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate().toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date(0).toISOString();
}

function mapGuide(doc: QueryDocumentSnapshot<DocumentData>): Guide {
  const d = doc.data();
  return {
    slug: (d.slug as string) ?? doc.id,
    title: d.title ?? "",
    excerpt: d.excerpt ?? "",
    content: d.content ?? "",
    level: d.level ?? "beginner",
    topic: d.topic ?? "",
    order: typeof d.order === "number" ? d.order : 0,
    tags: Array.isArray(d.tags) ? d.tags : [],
    coverImage: d.coverImage ?? "",
    status: d.status ?? "published",
    publishedAt: toIso(d.publishedAt),
    updatedAt: toIso(d.updatedAt ?? d.publishedAt),
    readingTimeMinutes: d.readingTimeMinutes ?? 1,
    metaTitle: d.metaTitle ?? d.title ?? "",
    metaDescription: d.metaDescription ?? d.excerpt ?? "",
    keywords: Array.isArray(d.keywords) ? d.keywords : [],
    aiModel: d.aiModel ?? "",
  };
}

// Guides degrade to empty results so the build/pages never crash if Firestore
// is unreachable — same approach as src/lib/posts.ts.
function onReadError(scope: string, err: unknown): [] {
  console.error(`[guides] ${scope} failed:`, err);
  return [];
}

/**
 * All published guides, ordered by level (beginner → advanced) then by their
 * intended `order`. Sorted in memory so it needs no composite index — the guide
 * set is small.
 */
export async function getGuides(): Promise<Guide[]> {
  try {
    const snap = await adminDb
      .collection(GUIDES)
      .where("status", "==", "published")
      .limit(200)
      .get();
    return snap.docs
      .map(mapGuide)
      .sort(
        (a, b) =>
          LEVEL_RANK[a.level] - LEVEL_RANK[b.level] ||
          a.order - b.order ||
          a.title.localeCompare(b.title),
      );
  } catch (err) {
    return onReadError("getGuides", err);
  }
}

/** Published guides for one level, in sequence. */
export async function getGuidesByLevel(level: Level): Promise<Guide[]> {
  const all = await getGuides();
  return all.filter((g) => g.level === level);
}

/** A single published guide by slug, or null. */
export async function getGuideBySlug(slug: string): Promise<Guide | null> {
  try {
    const doc = await adminDb.collection(GUIDES).doc(slug).get();
    if (!doc.exists) return null;
    const guide = mapGuide(doc as QueryDocumentSnapshot<DocumentData>);
    return guide.status === "published" ? guide : null;
  } catch (err) {
    console.error("[guides] getGuideBySlug failed:", err);
    return null;
  }
}

/** All published guide slugs + updatedAt — for the sitemap and static params. */
export async function getAllGuideSlugs(): Promise<
  { slug: string; updatedAt: string }[]
> {
  try {
    const snap = await adminDb
      .collection(GUIDES)
      .where("status", "==", "published")
      .select("slug", "updatedAt")
      .get();
    return snap.docs.map((doc) => ({
      slug: (doc.data().slug as string) ?? doc.id,
      updatedAt: toIso(doc.data().updatedAt),
    }));
  } catch (err) {
    return onReadError("getAllGuideSlugs", err);
  }
}
