import "server-only";

/**
 * Outbound transactional email, over Resend's REST API.
 *
 * A bare `fetch` rather than the `resend` SDK on purpose: the entire surface
 * needed is one POST, and every dependency added here is bundled into the App
 * Hosting server image. This is also the transport the approve-link flow will
 * reuse, so it is deliberately generic rather than contact-form shaped.
 *
 * Configuration (both required for mail to actually leave):
 *   RESEND_API_KEY — Secret Manager, wired in apphosting.yaml.
 *   MAIL_FROM      — sender on a Resend-verified domain.
 */

const ENDPOINT = "https://api.resend.com/emails";

/**
 * Generous but bounded. This is awaited inside a Server Action, so the ceiling
 * is a person watching a spinner — not a background job that can retry.
 */
const TIMEOUT_MS = 10_000;

const DEFAULT_FROM = "TheCryptoDesk <noreply@thecryptodesk.com>";

export interface MailMessage {
  to: string;
  subject: string;
  text: string;
  /**
   * Where a reply should go. Note this is NOT the same as `from`: sending as
   * the submitter's own address would fail SPF/DKIM at the receiving end and
   * get the mail junked or refused outright. The envelope is always ours and
   * the human's address rides here.
   */
  replyTo?: string;
}

export type MailResult = { ok: true } | { ok: false; error: string };

/** Whether `sendMail` can do anything. Callers use this to degrade, not to gate. */
export function mailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

/** CR/LF are meaningless in a JSON subject but corrupt anything that later relays it. */
function oneLine(value: string): string {
  return value.replace(/[\r\n]+/g, " ").trim();
}

export async function sendMail(msg: MailMessage): Promise<MailResult> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "RESEND_API_KEY is not set" };

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.MAIL_FROM ?? DEFAULT_FROM,
        to: [msg.to],
        subject: oneLine(msg.subject),
        text: msg.text,
        ...(msg.replyTo ? { reply_to: [msg.replyTo] } : {}),
      }),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (!res.ok) {
      // Resend puts the actual reason in the body — a bare status code here is
      // almost always "domain not verified" or "from address not allowed" and
      // is not worth debugging blind.
      const body = await res.text().catch(() => "");
      return { ok: false, error: `resend ${res.status}: ${body.slice(0, 300)}` };
    }

    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}
