"use client";

import { useRouter } from "next/navigation";
import { authClient } from "~/server/better-auth/client";
import { Button } from "./ui/button";
import { toast } from "sonner";

type SignOutButtonProps = {
  className?: string;
};

export default function SignOutButton({ className }: SignOutButtonProps) {
  const router = useRouter();
  return (
    <Button
      variant="ghost"
      className={className}
      onClick={async () => {
        const toastId = toast.loading("signing out...", {
          position: "top-center",
        });
        try {
          await authClient.signOut();
          toast.success("signed out", { position: "top-center", id: toastId });
          router.refresh();
        } catch {
          toast.error("could not sign out ", {
            position: "top-center",
            id: toastId,
          });
        }
      }}
    >
      sign out
    </Button>
  );
}
