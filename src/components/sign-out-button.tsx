"use client";

import { useRouter } from "next/navigation";
import { authClient } from "~/server/better-auth/client";

export default function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        await authClient.signOut();
        router.refresh();
      }}
    >
      sign out
    </button>
  );
}
