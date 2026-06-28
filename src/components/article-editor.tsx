import SubmitButton from "./submit-button";
import { deleteArticleAction } from "~/server/actions";

type ArticleEditorProps = {
  mode: "create" | "edit";
  action: (formData: FormData) => Promise<void>;
  initialValues?: {
    title: string;
    content: string;
    imageUrl: string | null;
    slug: string;
    published: boolean;
  };
};
export default function ArticleEditor({
  mode,
  action,
  initialValues,
}: ArticleEditorProps) {
  return (
    //TODO:design in shape of article-display
    <div>
      <form action={action} className="flex flex-col">
        <input
          name="title"
          defaultValue={initialValues?.title ?? ""}
          placeholder="title"
        />
        <input
          name="imageUrl"
          defaultValue={initialValues?.imageUrl ?? ""}
          placeholder="image url"
        />
        <textarea
          name="content"
          defaultValue={initialValues?.content ?? ""}
          placeholder="content"
        />
        <label>
          <input
            type="checkbox"
            name="published"
            defaultChecked={initialValues?.published ?? false}
          />
          publish
        </label>
        <SubmitButton mode={mode} />
      </form>
      {initialValues && (
        // TODO:shadcn this
        <form action={deleteArticleAction.bind(null, initialValues.slug)}>
          <button>delete</button>
        </form>
      )}
    </div>
  );
}
