"use client";
import { useActionState } from "react";
import { type ArticleFormState } from "~/server/articles";
import SubmitButton from "./submit-button";
import { deleteArticleAction } from "~/server/actions";

const initialArticleFormState: ArticleFormState = {
  success: false,
};

type ArticleEditorProps = {
  mode: "create" | "edit";
  action: (
    state: ArticleFormState,
    formData: FormData,
  ) => Promise<ArticleFormState>;
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
  const [state, formAction] = useActionState(action, initialArticleFormState);
  return (
    //TODO:design in shape of article-display
    <div>
      <form action={formAction} className="flex flex-col">
        <input
          name="title"
          defaultValue={initialValues?.title ?? ""}
          placeholder="title"
        />
        {state.errors?.title?.map((error) => (
          <p key={error} className="text-sm text-red-500!">
            {error}
          </p>
        ))}
        <input
          name="imageUrl"
          defaultValue={initialValues?.imageUrl ?? ""}
          placeholder="image url"
        />
        {state.errors?.imageUrl?.map((error) => (
          <p key={error} className="text-sm text-red-500!">
            {error}
          </p>
        ))}
        <textarea
          name="content"
          defaultValue={initialValues?.content ?? ""}
          placeholder="write your article in Markdown..."
        />
        {state.errors?.content?.map((error) => (
          <p key={error} className="text-sm text-red-500!">
            {error}
          </p>
        ))}
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
      {state.errors?._form?.map((error) => (
        <p key={error} className="text-sm text-red-500!">
          {error}
        </p>
      ))}
      {initialValues && (
        // TODO:shadcn this
        <form action={deleteArticleAction.bind(null, initialValues.slug)}>
          <button>delete</button>
        </form>
      )}
    </div>
  );
}
