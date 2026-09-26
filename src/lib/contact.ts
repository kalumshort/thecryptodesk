/**
 * Shared contact-form contract.
 *
 * Lives outside both the `"use server"` action module and the client component
 * because each needs it and neither can export to the other: a `"use server"`
 * file may only export async functions, so constants and types cannot ride
 * along with the action itself.
 */

/**
 * Fixed topic list, mirroring the sections of the contact page copy. A closed
 * set keeps the inbox sortable and gives the server something it can actually
 * validate — a free-text subject line can only be length-checked.
 */
export const CONTACT_TOPICS = [
  "Correction",
  "Publisher or takedown",
  "Press",
  "Something else",
] as const;

export type ContactTopic = (typeof CONTACT_TOPICS)[number];

export const MESSAGE_MIN = 20;
export const MESSAGE_MAX = 5000;

export type ContactField = "name" | "email" | "topic" | "message";

export interface ContactState {
  status: "idle" | "sent" | "error";
  /** Form-level message: the success line, or why the whole submission failed. */
  message?: string;
  fieldErrors?: Partial<Record<ContactField, string>>;
  /** Echoed back so a rejected submission never wipes what someone typed. */
  values?: Record<ContactField, string>;
}

export const INITIAL_CONTACT_STATE: ContactState = { status: "idle" };
