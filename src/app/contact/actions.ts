"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { sendMail } from "@/lib/mail";
import { CONTACT_EMAIL, SITE_NAME } from "@/lib/seo";
import {
  CONTACT_TOPICS,
  MESSAGE_MAX,
  MESSAGE_MIN,
  type ContactState,
} from "@/lib/contact";

/**
 * Where submissions land. Defaults to the address published across the site,
 * with an env override so the destination can be repointed (or aimed at a
 * test inbox) without a code change.
 */
const TO = process.env.CONTACT_TO_EMAIL ?? CONTACT_EMAIL;

const RATE_WINDOW_MS = 60 * 60 * 1000;

/** Per-person ceiling, applied only when the client can actually be told apart. */
const RATE_MAX_PER_CLIENT = 5;

/**
 * Floodgate for when it cannot. Firebase App Hosting's edge does not forward
 * the client address to the Cloud Run origin — request logs show the edge
 * seeing the real browser while the origin sees a rotating Google egress IP
 * and a user-agent of literally "Google" — so on this platform every
 * submission currently shares one bucket.
 *
 * That makes the number load-bearing: at the per-client value of 5 the form
 * goes down site-wide for an hour after the fifth message from anyone. This is
 * deliberately high enough to be invisible to real use and still stop a script.
 */
const RATE_MAX_SHARED = 60;

/** Pragmatic, not RFC 5322. The real validity test is whether a reply arrives. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const SENT_MESSAGE =
  "Thanks — that reached us. We read everything and reply to most things " +
  "within a couple of days.";

/**
 * Throttle held in a single Firestore doc per bucket.
 *
 * A counter doc rather than a query over submissions: one transactional
 * get/set, no composite index, nothing to backfill. Fails OPEN — a Firestore
 * blip should not take the only contact route offline, and the cost of a
 * missed throttle is some spam in a mailbox.
 */
async function withinRateLimit(bucket: string, max: number): Promise<boolean> {
  const ref = adminDb.collection("contactRate").doc(bucket);

  try {
    return await adminDb.runTransaction(async (tx) => {
      const snap = await tx.get(ref);
      const data = snap.data();
      const now = Date.now();

      const windowStart = typeof data?.windowStart === "number" ? data.windowStart : 0;
      const count = typeof data?.count === "number" ? data.count : 0;

      if (now - windowStart > RATE_WINDOW_MS) {
        // `ttlAt` lets a Firestore TTL policy reap these; without one they are
        // tiny and harmless, but they would accumulate forever.
        tx.set(ref, {
          windowStart: now,
          count: 1,
          ttlAt: new Date(now + 2 * RATE_WINDOW_MS),
        });
        return true;
      }

      if (count >= max) return false;

      tx.set(ref, { count: count + 1 }, { merge: true });
      return true;
    });
  } catch {
    return true;
  }
}

/**
 * Headers that may carry the real client address, best first.
 *
 * None of these survive Firebase App Hosting's edge today (see RATE_MAX_SHARED),
 * so this normally yields null. The list is still worth having: the same code
 * runs locally and behind proxies that do set them, and an edge that starts
 * forwarding the client would silently upgrade the throttle rather than need
 * a code change.
 */
const IP_HEADERS = [
  "x-forwarded-for",
  "x-real-ip",
  "true-client-ip",
  "x-client-ip",
] as const;

function resolveClientIp(h: Headers): string | null {
  for (const name of IP_HEADERS) {
    const first = h.get(name)?.split(",")[0]?.trim();
    // Some proxies write the literal token "unknown" rather than omitting.
    if (first && first.toLowerCase() !== "unknown") return first;
  }

  // RFC 7239, e.g. `Forwarded: for="[2001:db8::1]:443";proto=https`
  return h.get("forwarded")?.match(/for="?\[?([^\];,"]+)/i)?.[1] ?? null;
}

async function clientFingerprint(): Promise<{
  ipHash: string | null;
  userAgent: string;
}> {
  const h = await headers();
  const ip = resolveClientIp(h);

  if (!ip) {
    // Named header list only, never values — these carry cookies and tokens.
    // This is the signal that tells us if the platform ever starts forwarding.
    console.warn(
      `[contact] no client IP header; falling back to the shared bucket. ` +
        `headers seen: ${[...h.keys()].join(",")}`,
    );
  }

  return {
    // Hashed, never raw: it exists to tell submitters apart and to correlate
    // abuse, and neither of those needs the address itself.
    ipHash: ip ? createHash("sha256").update(ip).digest("hex").slice(0, 32) : null,
    userAgent: (h.get("user-agent") ?? "").slice(0, 300),
  };
}

export async function submitContact(
  _prev: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const read = (key: string, max: number) =>
    String(formData.get(key) ?? "")
      .trim()
      .slice(0, max);

  const values = {
    name: read("name", 200),
    email: read("email", 320),
    topic: read("topic", 200),
    message: read("message", MESSAGE_MAX * 2),
  };

  // Honeypot. A real browser never fills a field it cannot see, and answering
  // with the success state means a bot gets no signal to tune against.
  if (read("company", 100)) return { status: "sent", message: SENT_MESSAGE };

  const fieldErrors: NonNullable<ContactState["fieldErrors"]> = {};

  if (values.name.length < 2) {
    fieldErrors.name = "Tell us what to call you.";
  }
  if (!EMAIL_RE.test(values.email)) {
    fieldErrors.email = "That does not look like an email address.";
  }
  if (!CONTACT_TOPICS.includes(values.topic as (typeof CONTACT_TOPICS)[number])) {
    fieldErrors.topic = "Pick a topic.";
  }
  if (values.message.length < MESSAGE_MIN) {
    fieldErrors.message = `A little more detail, please — at least ${MESSAGE_MIN} characters.`;
  } else if (values.message.length > MESSAGE_MAX) {
    fieldErrors.message = `That is over the ${MESSAGE_MAX.toLocaleString()} character limit.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors, values };
  }

  const { ipHash, userAgent } = await clientFingerprint();

  // A resolvable client gets its own allowance; everyone else shares one much
  // larger bucket. Without the split an unidentifiable client would consume a
  // 5/hour per-person limit on behalf of the entire site.
  const bucket = ipHash ? `ip:${ipHash}` : "shared";
  const limit = ipHash ? RATE_MAX_PER_CLIENT : RATE_MAX_SHARED;

  if (!(await withinRateLimit(bucket, limit))) {
    return {
      status: "error",
      message: ipHash
        ? `That is a few messages in a short time. Try again in an hour, or email ${TO} directly.`
        : `The form is taking more messages than usual right now. Please email ${TO} directly.`,
      values,
    };
  }

  // Persist BEFORE sending. Resend can be down, unconfigured, or rate-limiting
  // us; none of those should lose someone's correction. The document is the
  // record of receipt and the mail is a notification about it.
  let docId = "unsaved";
  try {
    const ref = await adminDb.collection("contactMessages").add({
      ...values,
      ipHash,
      rateBucket: bucket,
      userAgent,
      createdAt: FieldValue.serverTimestamp(),
      delivered: false,
      deliveryError: null,
    });
    docId = ref.id;
  } catch (err) {
    // Nothing is stored and nothing is sent yet — this is the one case where
    // the person genuinely must be told to use another route.
    console.error("[contact] Firestore write failed", err);
    return {
      status: "error",
      message: `Something broke on our side and your message was not saved. Please email ${TO} directly.`,
      values,
    };
  }

  const result = await sendMail({
    to: TO,
    replyTo: values.email,
    subject: `[${SITE_NAME}] ${values.topic} — ${values.name}`,
    text: [
      `Topic:  ${values.topic}`,
      `Name:   ${values.name}`,
      `Email:  ${values.email}`,
      "",
      "─".repeat(58),
      values.message,
      "─".repeat(58),
      "",
      `Reply directly to this email to answer ${values.name}.`,
      `Stored as contactMessages/${docId} · client ${ipHash?.slice(0, 12) ?? "not forwarded by the edge"}`,
    ].join("\n"),
  });

  adminDb
    .collection("contactMessages")
    .doc(docId)
    .set(
      { delivered: result.ok, deliveryError: result.ok ? null : result.error },
      { merge: true },
    )
    .catch((err) => console.error("[contact] delivery flag write failed", err));

  if (!result.ok) {
    // Loud, because this is invisible from the outside: the sender is told we
    // have their message, which is true, but nobody is being notified.
    console.error(
      `[contact] stored contactMessages/${docId} but mail failed — ${result.error}`,
    );
  }

  return { status: "sent", message: SENT_MESSAGE };
}
