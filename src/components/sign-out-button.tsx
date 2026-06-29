"use client";

import { useRouter } from "next/navigation";
import { authClient } from "~/server/better-auth/client";

type SignOutButtonProps = {
  className?: string;
};

export default function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();
  return (
    <button
      className={className}
      onClick={async () => {
        await authClient.signOut();
        router.refresh();
      }}
    >
      sign out
    </button>
  );
}
