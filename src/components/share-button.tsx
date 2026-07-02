import { env } from "~/env";
import { Button } from "./ui/button";
import { toast } from "sonner";

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
            `${env.NEXT_PUBLIC_BLOGGIN_URL}article/${slug}`,
          );
          toast.success("link copied", { position: "top-center" });
        } catch {
          toast.error("could not copy link", { position: "top-center" });
        }
      }}
    >
      {"share"}
    </Button>
  );
}
