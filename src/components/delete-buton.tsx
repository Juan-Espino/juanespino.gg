import { deleteArticleAction } from "~/server/actions";

type DeleteButtonProps = {
  slug: string;
};
export default function DeleteButton({ slug }: DeleteButtonProps) {
  return (
    <form
      action={async () => {
        await deleteArticleAction(slug);
      }}
    >
      <button type="submit" className="text-red-500">
        delete
      </button>
    </form>
  );
}
