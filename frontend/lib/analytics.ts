/**
 * Product analytics (PRD-04 §3.5). Off unless NEXT_PUBLIC_POSTHOG_KEY is set.
 * Only the named events below are sent — no autocapture, no session
 * recording, no cookies (memory persistence) and never personal data such as
 * names, emails, answers or chats. Call `track` from the handler of a
 * successful action, never during render, so each event fires exactly once
 * per real occurrence. Props are counts, flags and categories only: e.g.
 * question_feedback_requested carries the 0-10 score, never the answer text.
 */

import type { CaptureResult } from "posthog-js";

export type AnalyticsEvent =
  | { name: "signup_completed"; props: { method: "email" | "google" } }
  | { name: "onboarding_completed"; props?: undefined }
  | { name: "skill_check_completed"; props: { category: string; mastered: boolean } }
  | { name: "dashboard_viewed"; props: { has_results: boolean } }
  | { name: "task_submitted"; props: { passed: boolean } }
  | { name: "password_reset_completed"; props?: undefined }
  | { name: "question_bookmarked"; props?: Record<string, never> }
  | { name: "question_solved"; props?: Record<string, never> }
  | { name: "prep_pdf_downloaded"; props?: Record<string, never> }
  /** AI feedback came back on a written interview answer. */
  | { name: "question_feedback_requested"; props: { score: number } }
  /** "My skills" switched on or off on the question bank. */
  | { name: "my_skills_toggled"; props: { on: boolean } }
  /** "Ask coach about this question" on a question page. */
  | { name: "coach_asked_about_question"; props?: Record<string, never> };

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

type PostHog = typeof import("posthog-js").default;
let client: Promise<PostHog | null> | null = null;

// Properties PostHog fills in with a URL. Their query strings and hashes can
// carry personal data (e.g. /forgot-password?email=…), so only the path is sent.
const URL_PROPERTIES = [
  "$current_url",
  "$pathname",
  "$referrer",
  "$initial_current_url",
  "$initial_referrer",
];

/** "https://x.y/a?b#c" → "https://x.y/a"; leaves anything else (e.g. "$direct") as is. */
export function stripQuery(value: unknown): unknown {
  return typeof value === "string" ? value.split(/[?#]/, 1)[0] : value;
}

/** before_send hook: strips query strings and hashes from every URL property. */
export function sanitizeEvent(event: CaptureResult | null): CaptureResult | null {
  if (!event) return event;
  for (const bag of [event.properties, event.$set, event.$set_once]) {
    if (!bag) continue;
    for (const key of URL_PROPERTIES) {
      if (key in bag) bag[key] = stripQuery(bag[key]);
    }
  }
  return event;
}

function load() {
  if (!KEY || typeof window === "undefined") return Promise.resolve(null);
  client ??= import("posthog-js")
    .then(({ default: posthog }) => {
      posthog.init(KEY, {
        api_host: HOST,
        autocapture: false,
        capture_pageview: "history_change",
        capture_pageleave: false,
        disable_session_recording: true,
        persistence: "memory",
        person_profiles: "never",
        before_send: sanitizeEvent,
      });
      return posthog;
    })
    .catch(() => null);
  return client;
}

export function track<E extends AnalyticsEvent>(name: E["name"], props?: E["props"]) {
  void load().then((posthog) => posthog?.capture(name, props ?? {}));
}
