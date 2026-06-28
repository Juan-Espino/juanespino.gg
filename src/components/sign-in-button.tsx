"use client";

import { authClient } from "~/server/better-auth/client";

export default function SignInButton() {
  return (
    // TODO:shadcn this bitch
    <button
      onClick={async () => {
        await authClient.signIn.social({
          provider: "github",
        });
      }}
    >
      sign in
    </button>
  );
}
