"use client";

import { authClient } from "~/server/better-auth/client";
import { Button } from "./ui/button";
import { toast } from "sonner";
import { blogginRoutes } from "~/lib/routes";

type SignInButtonProps = {
  className?: string;
};

export default function SignInButton({ className }: SignInButtonProps) {
  return (
    <Button
      variant="ghost"
      className={className}
      onClick={async () => {
        const toastId = toast.loading("redirecting to GitHub...", {
          position: "top-center",
        });
        try {
          await authClient.signIn.social({
            provider: "github",
            callbackURL: blogginRoutes.home,
          });
        } catch {
          toast.error("could not start sign in", {
            id: toastId,
          });
        }
      }}
    >
      sign in
    </Button>
  );
}
