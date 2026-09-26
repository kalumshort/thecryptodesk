"use client";

import { useActionState, useId, useState } from "react";
import { Check, Send, TriangleAlert } from "lucide-react";
import { submitContact } from "@/app/contact/actions";
import {
  CONTACT_TOPICS,
  INITIAL_CONTACT_STATE,
  MESSAGE_MAX,
  type ContactField,
} from "@/lib/contact";

const FIELD_CLASS =
  "w-full rounded-sm border border-line bg-raised/50 px-3 py-2.5 text-sm " +
  "text-foreground outline-none transition-colors placeholder:text-text-low " +
  "focus:border-cyan focus:ring-1 focus:ring-cyan/40";

const LABEL_CLASS =
  "mb-1.5 block font-mono text-[11px] uppercase tracking-widest text-text-low";

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-magenta">
      {error}
    </p>
  );
}

/**
 * The contact form.
 *
 * Progressive enhancement is real here: the `<form action={…}>` posts to the
 * Server Action without JavaScript, so the only things the hydrated version
 * adds are the pending state and the character counter.
 */
export function ContactForm() {
  const [state, formAction, pending] = useActionState(
    submitContact,
    INITIAL_CONTACT_STATE,
  );
  const uid = useId();
  const [length, setLength] = useState(0);

  const fieldId = (name: ContactField) => `${uid}-${name}`;
  const errorId = (name: ContactField) => `${uid}-${name}-error`;
  const errorFor = (name: ContactField) => state.fieldErrors?.[name];

  /** Wires a field to its error text for screen readers, or omits it entirely. */
  const a11y = (name: ContactField) =>
    errorFor(name)
      ? { "aria-invalid": true as const, "aria-describedby": errorId(name) }
      : {};

  if (state.status === "sent") {
    return (
      <div
        className="panel glow-border-cyan rounded-sm p-6 text-center"
        role="status"
        aria-live="polite"
      >
        <Check className="mx-auto mb-3 h-7 w-7 text-acid" aria-hidden />
        <p className="font-display text-sm font-bold uppercase tracking-[0.2em] text-cyan">
          Message received
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          {state.message}
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="panel rounded-sm p-5 sm:p-6">
      {/* Honeypot. Hidden from sight AND from the accessibility tree, and taken
          out of the tab order, so no real person can reach it by any route. */}
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${uid}-company`}>Company</label>
        <input
          id={`${uid}-company`}
          type="text"
          name="company"
          tabIndex={-1}
          autoComplete="off"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={LABEL_CLASS} htmlFor={fieldId("name")}>
            Name
          </label>
          <input
            id={fieldId("name")}
            name="name"
            type="text"
            required
            maxLength={200}
            autoComplete="name"
            defaultValue={state.values?.name}
            className={FIELD_CLASS}
            placeholder="Jane Doe"
            {...a11y("name")}
          />
          <FieldError id={errorId("name")} error={errorFor("name")} />
        </div>

        <div>
          <label className={LABEL_CLASS} htmlFor={fieldId("email")}>
            Email
          </label>
          <input
            id={fieldId("email")}
            name="email"
            type="email"
            required
            maxLength={320}
            autoComplete="email"
            defaultValue={state.values?.email}
            className={FIELD_CLASS}
            placeholder="you@example.com"
            {...a11y("email")}
          />
          <FieldError id={errorId("email")} error={errorFor("email")} />
        </div>
      </div>

      <div className="mt-4">
        <label className={LABEL_CLASS} htmlFor={fieldId("topic")}>
          Topic
        </label>
        <select
          id={fieldId("topic")}
          name="topic"
          required
          defaultValue={state.values?.topic ?? CONTACT_TOPICS[0]}
          className={FIELD_CLASS}
          {...a11y("topic")}
        >
          {CONTACT_TOPICS.map((topic) => (
            <option key={topic} value={topic} className="bg-void">
              {topic}
            </option>
          ))}
        </select>
        <FieldError id={errorId("topic")} error={errorFor("topic")} />
      </div>

      <div className="mt-4">
        <label className={LABEL_CLASS} htmlFor={fieldId("message")}>
          Message
        </label>
        <textarea
          id={fieldId("message")}
          name="message"
          required
          rows={7}
          maxLength={MESSAGE_MAX}
          defaultValue={state.values?.message}
          onChange={(e) => setLength(e.target.value.length)}
          className={`${FIELD_CLASS} resize-y leading-relaxed`}
          placeholder="For a correction, include the article URL and the figure or claim that is wrong."
          {...a11y("message")}
        />
        <div className="mt-1.5 flex items-start justify-between gap-4">
          <FieldError id={errorId("message")} error={errorFor("message")} />
          <span className="ml-auto shrink-0 font-mono text-[11px] text-text-low">
            {length.toLocaleString()} / {MESSAGE_MAX.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Form-level failure: rate limiting, or a write that did not land. */}
      {state.status === "error" && state.message ? (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-sm border border-magenta/40 bg-magenta/10 px-3 py-2.5 text-xs leading-relaxed text-magenta"
        >
          <TriangleAlert className="mt-px h-4 w-4 shrink-0" aria-hidden />
          {state.message}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 rounded-sm bg-cyan px-5 py-2.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-void transition-opacity hover:opacity-85 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Send className="h-3.5 w-3.5" aria-hidden />
          {pending ? "Sending…" : "Send message"}
        </button>
        <p className="text-xs text-text-low">
          We use your address to reply, and nothing else.
        </p>
      </div>
    </form>
  );
}
