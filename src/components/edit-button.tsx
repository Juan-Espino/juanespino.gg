import Link from "next/link";
import { blogginRoutes } from "~/lib/routes";
import { Button } from "./ui/button";

type EditButtonProps = {
  slug: string;
};
export default function EditButton({ slug }: EditButtonProps) {
  return (
    <Button asChild variant="ghost" size="lg">
      <Link href={blogginRoutes.edit(slug)}>edit</Link>
    </Button>
  );
}
