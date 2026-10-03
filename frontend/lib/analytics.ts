/**
 * Product analytics (PRD-04 §3.5). Off unless NEXT_PUBLIC_POSTHOG_KEY is set.
 * Only the named events below are sent — no autocapture, no session
 * recording, no cookies (memory persistence) and never personal data such as
 * names, emails, answers or chats. Call `track` from the handler of a
 * successful action, never during render, so each event fires exactly once
 * per real occurrence.
 */

export type AnalyticsEvent =
  | { name: "signup_completed"; props: { method: "email" | "google" } }
  | { name: "onboarding_completed"; props?: undefined }
  | { name: "skill_check_completed"; props: { category: string; mastered: boolean } }
  | { name: "dashboard_viewed"; props: { has_results: boolean } }
  | { name: "task_submitted"; props: { passed: boolean } }
  | { name: "password_reset_completed"; props?: undefined };

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY;
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com";

type PostHog = typeof import("posthog-js").default;
let client: Promise<PostHog | null> | null = null;

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
      });
      return posthog;
    })
    .catch(() => null);
  return client;
}

export function track<E extends AnalyticsEvent>(name: E["name"], props?: E["props"]) {
  void load().then((posthog) => posthog?.capture(name, props ?? {}));
}
