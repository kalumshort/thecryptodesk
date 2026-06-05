# TheCryptoDesk

An SEO-first cryptocurrency **news website**.

- **Frontend:** Next.js (App Router, TypeScript, Tailwind v4 + shadcn/ui), server-rendered on **Firebase App Hosting**.
- **Ingest pipeline:** a scheduled **Cloud Function** fetches crypto RSS feeds, rewrites each article into original copy + SEO metadata with **Gemini (Vertex AI)**, and writes it to **Firestore**.
- **Data:** Firestore is the single source of truth; the site reads it server-side for fast, crawlable pages.

```
RSS feeds ──▶ scheduledNewsIngest (Cloud Function) ──▶ Gemini rewrite ──▶ Firestore ──▶ Next.js (SSR/ISR)
```

## Project layout

| Path | Purpose |
|---|---|
| `src/app/` | Pages: home, `news/[slug]`, `category/[category]`, `sitemap.ts`, `robots.ts` |
| `src/lib/firebase-admin.ts` | Admin SDK singleton (server only) |
| `src/lib/posts.ts` | Firestore read helpers |
| `src/lib/seo.ts` | Metadata + JSON-LD builders |
| `src/types/post.ts` | `Post` type + category taxonomy |
| `functions/src/` | `feeds.ts`, `rss.ts`, `rewrite.ts`, `ingest.ts`, `index.ts` |
| `firestore.rules` / `firestore.indexes.json` | Public read of published posts; query indexes |
| `apphosting.yaml` | App Hosting runtime config |

## Firestore data model

- **`posts/{slug}`** — `title`, `excerpt`, `content` (Markdown), `category`, `tags[]`, `coverImage`, `sourceUrl`, `sourceName`, `status`, `publishedAt`, `createdAt`, `updatedAt`, `readingTimeMinutes`, `metaTitle`, `metaDescription`, `keywords[]`, `aiModel`.
- **`seen/{sha256(guid)}`** — dedup ledger so each source article is processed once.

Categories: `bitcoin`, `ethereum`, `altcoins`, `defi`, `nft`, `regulation`, `market`.

---

## One-time setup

1. **Create / select a Firebase project** (Blaze plan — required for Cloud Functions, App Hosting, and Vertex AI).
2. Set the project id in **`.firebaserc`** (replace `YOUR_FIREBASE_PROJECT_ID`).
3. **Enable APIs** in the Google Cloud console for that project:
   - Vertex AI API (`aiplatform.googleapis.com`)
   - Cloud Functions, Cloud Run, Cloud Scheduler, Firestore
4. **Grant Vertex AI access** to the function's runtime service account. The
   functions are pinned (in `functions/src/index.ts`) to run as the Firebase
   Admin SDK service account, so grant the role to that account:
   ```bash
   gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
     --member="serviceAccount:firebase-adminsdk-fbsvc@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```
   (Or in the console: IAM → edit that principal → add the **Vertex AI User**
   role. App Hosting's Cloud Run service account already has Firestore access
   within the same project.)
5. *(Optional)* Set the manual-trigger secret:
   ```bash
   firebase functions:secrets:set INGEST_TRIGGER_KEY
   ```

---

## Local development

Install deps (already done if you scaffolded here):

```bash
npm install
npm install --prefix functions
```

`.env.local` is preconfigured to point at the **Firestore emulator**.

**Terminal 1 — emulators + functions:**
```bash
npm --prefix functions run build
firebase emulators:start --only functions,firestore
```

**Generate some posts** (emulator allows the manual trigger without a key):
```bash
# URL is printed by the emulator; default:
curl http://127.0.0.1:5001/demo-thecryptodesk/us-central1/runIngestNow
```
> Note: Vertex AI has no emulator. To rewrite for real, run the function against
> a real project with `aiplatform.user` granted, or stub `rewriteArticle` while
> developing the UI. Inspect written docs in the Emulator UI at http://127.0.0.1:4000.

**Terminal 2 — the site:**
```bash
npm run dev      # http://localhost:3000
```

---

## Deploy

**Firestore rules/indexes + functions:**
```bash
firebase deploy --only firestore,functions
```

**Frontend (App Hosting)** is git-based: create a backend once and link a GitHub repo for continuous deployment.
```bash
firebase apphosting:backends:create
```
Push to the linked branch and App Hosting builds & serves the Next.js app. Update `NEXT_PUBLIC_SITE_URL` in `apphosting.yaml` to your real domain.

The scheduled function (`scheduledNewsIngest`) runs **every 60 minutes** automatically once deployed — adjust the schedule in `functions/src/index.ts`.

---

## SEO features

- Per-post `generateMetadata` (title, description, canonical, Open Graph, Twitter).
- `NewsArticle` JSON-LD on every post page.
- Dynamic `sitemap.xml` and `robots.txt` from Firestore.
- ISR (`revalidate = 300`) so new posts appear within 5 minutes without redeploy.

## Verify

- Posts appear on `/` and `/category/*` after an ingest run.
- View source of `/news/<slug>` → correct `<title>`, meta tags, JSON-LD.
- `/sitemap.xml` and `/robots.txt` resolve.
- Validate a post with Google's [Rich Results Test](https://search.google.com/test/rich-results).
