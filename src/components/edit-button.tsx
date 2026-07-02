import Link from "next/link";
import { Button } from "./ui/button";

type EditButtonProps = {
  slug: string;
};
export default function EditButton({ slug }: EditButtonProps) {
  return (
    <Button asChild variant="ghost" size="lg">
      <Link href={`/edit/${slug}`}>edit</Link>
    </Button>
  );
}
