import "server-only";
import type {
  DocumentData,
  QueryDocumentSnapshot,
  Timestamp,
} from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { stripMarkdown } from "@/lib/markdown";
import type { ArchiveEntry, Category, Post } from "@/types/post";

const POSTS = "posts";
const ARCHIVES = "archives";

function toIso(value: unknown): string {
  // Firestore Timestamp -> ISO string; tolerate already-Date / string values.
  if (value && typeof (value as Timestamp).toDate === "function") {
    return (value as Timestamp).toDate().toISOString();
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "string") return value;
  return new Date(0).toISOString();
}

function mapPost(doc: QueryDocumentSnapshot<DocumentData>): Post {
  const d = doc.data();
  return {
    slug: (d.slug as string) ?? doc.id,
    title: stripMarkdown(d.title ?? ""),
    // Rendered as plain text on cards and in meta tags, so Markdown emphasis
    // the generator emitted must not survive as literal asterisks.
    excerpt: stripMarkdown(d.excerpt ?? ""),
    content: d.content ?? "",
    category: d.category ?? "market",
    tags: Array.isArray(d.tags) ? d.tags : [],
    coverImage: d.coverImage ?? "",
    sourceUrl: d.sourceUrl ?? "",
    sourceName: d.sourceName ?? "",
    status: d.status ?? "published",
    publishedAt: toIso(d.publishedAt),
    updatedAt: toIso(d.updatedAt ?? d.publishedAt),
    readingTimeMinutes: d.readingTimeMinutes ?? 1,
    metaTitle: stripMarkdown(d.metaTitle ?? d.title ?? ""),
    metaDescription: stripMarkdown(d.metaDescription ?? d.excerpt ?? ""),
    keywords: Array.isArray(d.keywords) ? d.keywords : [],
    aiModel: d.aiModel ?? "",
  };
}

// Firestore may be unreachable at build time (no credentials / empty project).
// Reads degrade to empty results so pages render an empty state instead of
// crashing the build; errors are logged for observability.
function onReadError(scope: string, err: unknown): [] {
  console.error(`[posts] ${scope} failed:`, err);
  return [];
}

/** Posts per page on the paginated category / tag / archive listings. */
export const POSTS_PER_PAGE = 24;

/**
 * Hard ceiling on paginated pages per listing. Bounds both the crawl surface
 * (an unbounded archive is a crawl trap) and the Firestore `offset` cost, which
 * bills reads for every skipped document.
 */
export const MAX_PAGES = 20;

/** One page of a listing, plus what the pagination UI needs to render. */
export interface PostPage {
  posts: Post[];
  page: number;
  totalPages: number;
  total: number;
}

const EMPTY_PAGE = (page: number): PostPage => ({
  posts: [],
  page,
  totalPages: 0,
  total: 0,
});

/**
 * Run a listing query as a page: one `count()` aggregation for the total, one
 * windowed read for the documents.
 *
 * `offset` is used rather than `startAfter(cursor)` deliberately. A cursor is
 * cheaper but requires the previous page's last document, which we don't have
 * when a crawler deep-links straight to page 7. Because these pages are
 * ISR-cached, the skipped-document cost is paid once per revalidate window
 * rather than per visitor, and `MAX_PAGES` caps the worst case.
 */
async function runPagedQuery(
  base: FirebaseFirestore.Query,
  page: number,
  perPage: number,
  scope: string,
): Promise<PostPage> {
  try {
    const [countSnap, snap] = await Promise.all([
      base.count().get(),
      base
        .offset((page - 1) * perPage)
        .limit(perPage)
        .get(),
    ]);
    const total = countSnap.data().count;
    return {
      posts: snap.docs.map(mapPost),
      page,
      total,
      totalPages: Math.min(Math.ceil(total / perPage), MAX_PAGES),
    };
  } catch (err) {
    console.error(`[posts] ${scope} failed:`, err);
    return EMPTY_PAGE(page);
  }
}

/** One page of a category listing, newest first. */
export async function getPostsByCategoryPage(
  category: Category,
  page: number,
  perPage = POSTS_PER_PAGE,
): Promise<PostPage> {
  const base = adminDb
    .collection(POSTS)
    .where("category", "==", category)
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc");
  return runPagedQuery(base, page, perPage, "getPostsByCategoryPage");
}

/**
 * One page of a tag listing, newest first.
 *
 * Unlike `getPostsByTag`, this filters and sorts in Firestore rather than in
 * memory — paginating an in-memory slice of an arbitrary 60-document window
 * would return wrong results past page 1. Requires the
 * (tags CONTAINS, status ASC, publishedAt DESC) composite index.
 */
export async function getPostsByTagPage(
  tag: string,
  page: number,
  perPage = POSTS_PER_PAGE,
): Promise<PostPage> {
  const base = adminDb
    .collection(POSTS)
    .where("tags", "array-contains", tag)
    .where("status", "==", "published")
    .orderBy("publishedAt", "desc");
  return runPagedQuery(base, page, perPage, "getPostsByTagPage");
}

/** One page of a month's archive, newest first. */
export async function getPostsByMonthPage(
  year: number,
  month: number,
  page: number,
  perPage = POSTS_PER_PAGE,
): Promise<PostPage> {
  const start = new Date(Date.UTC(year, month - 1, 1));
  const end = new Date(Date.UTC(year, month, 1)); // rolls over Dec→Jan
  const base = adminDb
    .collection(POSTS)
    .where("status", "==", "published")
    .where("publishedAt", ">=", start)
    .where("publishedAt", "<", end)
    .orderBy("publishedAt", "desc");
  return runPagedQuery(base, page, perPage, "getPostsByMonthPage");
}

/**
 * Number of published posts per category, for `generateStaticParams` — counted
 * via aggregation so we never pull documents just to size the pagination.
 */
export async function countPostsByCategory(
  category: Category,
): Promise<number> {
  try {
    const snap = await adminDb
      .collection(POSTS)
      .where("category", "==", category)
      .where("status", "==", "published")
      .count()
      .get();
    return snap.data().count;
  } catch (err) {
    console.error("[posts] countPostsByCategory failed:", err);
    return 0;
  }
}

/** Total pages for a count, clamped to `MAX_PAGES`. */
export function pageCount(total: number, perPage = POSTS_PER_PAGE): number {
  return Math.min(Math.ceil(total / perPage), MAX_PAGES);
}

/** Latest published posts, newest first. */
export async function getLatestPosts(limit = 24): Promise<Post[]> {
  try {
    const snap = await adminDb
      .collection(POSTS)
      .where("status", "==", "published")
      .orderBy("publishedAt", "desc")
      .limit(limit)
      .get();
    return snap.docs.map(mapPost);
  } catch (err) {
    return onReadError("getLatestPosts", err);
  }
}

/**
 * Up to `limit` posts similar to the given one: same category first (newest),
 * excluding the post itself, topped up with latest posts if the category is thin.
 */
export async function getSimilarPosts(
  category: Category,
  excludeSlug: string,
  limit = 3,
): Promise<Post[]> {
  const sameCategory = await getPostsByCategory(category, limit + 1);
  const result = sameCategory
    .filter((p) => p.slug !== excludeSlug)
    .slice(0, limit);

  if (result.length < limit) {
    const seen = new Set([excludeSlug, ...result.map((p) => p.slug)]);
    const latest = await getLatestPosts(limit + 6);
    for (const p of latest) {
      if (result.length >= limit) break;
      if (seen.has(p.slug)) continue;
      result.push(p);
      seen.add(p.slug);
    }
  }
  return result;
}

/**
 * Published posts carrying a given tag, newest first. Uses Firestore's automatic
 * single-field array index (array-contains) and filters status + sorts in memory,
 * so it needs no composite index.
 */
export async function getPostsByTag(tag: string, limit = 24): Promise<Post[]> {
  try {
    const snap = await adminDb
      .collection(POSTS)
      .where("tags", "array-contains", tag)
      .limit(60)
      .get();
    return snap.docs
      .map(mapPost)
      .filter((p) => p.status === "published")
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
      .slice(0, limit);
  } catch (err) {
    return onReadError("getPostsByTag", err);
  }
}

/** Published posts for a single category, newest first. */
export async function getPostsByCategory(
  category: Category,
  limit = 24,
): Promise<Post[]> {
  try {
    const snap = await adminDb
      .collection(POSTS)
      .where("category", "==", category)
      .where("status", "==", "published")
      .orderBy("publishedAt", "desc")
      .limit(limit)
      .get();
    return snap.docs.map(mapPost);
  } catch (err) {
    return onReadError("getPostsByCategory", err);
  }
}

/**
 * Published posts published within a given month, newest first.
 * Uses a `publishedAt` range so it reuses the existing
 * (status ASC, publishedAt DESC) composite index — no extra fields or index.
 */
export async function getPostsByMonth(
  year: number,
  month: number,
  limit = 60,
): Promise<Post[]> {
  try {
    const start = new Date(Date.UTC(year, month - 1, 1));
    const end = new Date(Date.UTC(year, month, 1)); // rolls over Dec→Jan
    const snap = await adminDb
      .collection(POSTS)
      .where("status", "==", "published")
      .where("publishedAt", ">=", start)
      .where("publishedAt", "<", end)
      .orderBy("publishedAt", "desc")
      .limit(limit)
      .get();
    return snap.docs.map(mapPost);
  } catch (err) {
    return onReadError("getPostsByMonth", err);
  }
}

/** The date-archive index: one entry per month, newest month first. */
export async function getArchiveIndex(): Promise<ArchiveEntry[]> {
  try {
    // One doc per month — small enough to fetch whole and sort in memory,
    // which avoids needing a dedicated index.
    const snap = await adminDb.collection(ARCHIVES).get();
    return snap.docs
      .map((doc) => {
        const d = doc.data();
        return {
          year: d.year ?? 0,
          month: d.month ?? 0,
          count: d.count ?? 0,
        };
      })
      .sort((a, b) => b.year - a.year || b.month - a.month);
  } catch (err) {
    return onReadError("getArchiveIndex", err);
  }
}

/** A single published post by slug, or null. */
export async function getPostBySlug(slug: string): Promise<Post | null> {
  try {
    const doc = await adminDb.collection(POSTS).doc(slug).get();
    if (!doc.exists) return null;
    const post = mapPost(doc as QueryDocumentSnapshot<DocumentData>);
    return post.status === "published" ? post : null;
  } catch (err) {
    console.error("[posts] getPostBySlug failed:", err);
    return null;
  }
}

/**
 * Tag frequency across all published posts — used by the sitemap to list only
 * tags above the indexing threshold. Projects `tags` only, so it never pulls
 * article bodies just to count labels.
 */
export async function getPublishedTagCounts(): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  try {
    const snap = await adminDb
      .collection(POSTS)
      .where("status", "==", "published")
      .select("tags")
      .get();
    for (const doc of snap.docs) {
      const tags = doc.data().tags;
      if (!Array.isArray(tags)) continue;
      for (const tag of tags) {
        if (typeof tag !== "string") continue;
        counts.set(tag, (counts.get(tag) ?? 0) + 1);
      }
    }
  } catch (err) {
    console.error("[posts] getPublishedTagCounts failed:", err);
  }
  return counts;
}

/** All published slugs + updatedAt — used for the sitemap and static params. */
export async function getAllPublishedSlugs(): Promise<
  { slug: string; updatedAt: string }[]
> {
  try {
    const snap = await adminDb
      .collection(POSTS)
      .where("status", "==", "published")
      .select("slug", "updatedAt")
      .get();
    return snap.docs.map((doc) => ({
      slug: (doc.data().slug as string) ?? doc.id,
      updatedAt: toIso(doc.data().updatedAt),
    }));
  } catch (err) {
    return onReadError("getAllPublishedSlugs", err);
  }
}
