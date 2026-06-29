"use client";

import { authClient } from "~/server/better-auth/client";

type SignInButtonProps = {
  className?: string;
};

export default function SignInButton({ className }: SignInButtonProps) {
  return (
    <button
      className={className}
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
