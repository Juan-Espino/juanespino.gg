import posthog from "posthog-js";
import { env } from "~/env";

posthog.init(env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN, {
  api_host: env.NEXT_PUBLIC_POSTHOG_HOST,
  defaults: "2026-05-30",
  capture_pageview: true,
  capture_pageleave: true,
  autocapture: false,
  loaded: (posthog) => {
    if (env.NODE_ENV === "development") {
      posthog.debug();
    }
  },
});
