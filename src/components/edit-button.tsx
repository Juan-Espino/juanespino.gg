import Link from "next/link";
import { blogginRoutes } from "~/lib/routes";
import { Button } from "./ui/button";
import GlitchText from "~/components/motion/glitch-text";

type EditButtonProps = {
  slug: string;
};
export default function EditButton({ slug }: EditButtonProps) {
  return (
    <Button asChild variant="ghost" size="lg">
      <Link href={blogginRoutes.edit(slug)}>
        <GlitchText text="edit" />
      </Link>
    </Button>
  );
}
