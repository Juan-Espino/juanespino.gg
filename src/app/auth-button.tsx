"use client";

import { authClient } from "~/server/better-auth/client";

export default function AuthButton() {
  return (
    <button
      className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
      onClick={async () => {
        await authClient.signIn.social({
          provider: "github",
          callbackURL: "/",
        });
      }}
    >
      Sign in with Github
    </button>
  );
}
