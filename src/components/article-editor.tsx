"use client";
import { useActionState, useState } from "react";
import { type ArticleFormState } from "~/server/articles";
import SubmitButton from "./submit-button";
import { deleteArticleAction } from "~/server/actions";
import MarkdownContent from "./mardown-content";

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
  const [content, setContent] = useState(initialValues?.content ?? "");
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
          onChange={(event) => setContent(event.target.value)}
          placeholder="write your article in Markdown..."
        />
        {state.errors?.content?.map((error) => (
          <p key={error} className="text-sm text-red-500!">
            {error}
          </p>
        ))}
        <MarkdownContent
          content={content}
          className="rounded border border-yellow-200/50 p-4"
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
