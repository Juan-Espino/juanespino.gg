import { env } from "~/env";
import { Button } from "./ui/button";
import { toast } from "sonner";
import posthog from "posthog-js";
import { blogginRoutes } from "~/lib/routes";
import GlitchText from "~/components/motion/glitch-text";

type ShareButtonProps = {
  slug: string;
};
export default function ShareButton({ slug }: ShareButtonProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="lg"
      className=""
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(
            new URL(
              blogginRoutes.article(slug),
              env.NEXT_PUBLIC_SITE_URL,
            ).toString(),
          );
          posthog.capture("article_shared", {
            slug,
          });
          toast.success("link copied");
        } catch {
          toast.error("could not copy link");
        }
      }}
    >
      <GlitchText text="share" />
    </Button>
  );
}
