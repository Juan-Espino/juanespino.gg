"use client";
import { useActionState, useState } from "react";
import { type ArticleFormState } from "~/server/articles";
import SubmitButton from "./submit-button";
import MarkdownContent from "./markdown-content";
import DeleteButton from "./delete-buton";
import Image from "next/image";

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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-6 lg:max-w-5xl lg:px-6 lg:py-8">
      <header className="flex items-center justify-between gap-4">
        <div>
          <p className="text-bloggin-muted text-sm">
            {/* TODO: add the chatgpt left to right transition here in a loop */}
            {mode === "create" ? "making article..." : "editing article..."}
          </p>
        </div>
      </header>
      <form
        action={formAction}
        className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(420px,0.9fr)] lg:items-start lg:gap-8"
      >
        <div className="flex min-w-0 flex-col gap-4">
          <input
            className="border-bloggin-border/40 text-bloggin-foreground placeholder:text-bloggin-muted focus:border-bloggin-neon/70 w-full border-b bg-transparent py-3 text-3xl font-bold outline-none"
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
            className="border-bloggin-border/40 text-bloggin-foreground placeholder:text-bloggin-muted focus:border-bloggin-neon/70 w-full border-b bg-transparent py-3 text-xl font-bold outline-none"
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
            className="border-bloggin-border/40 text-bloggin-foreground placeholder:text-bloggin-muted focus:border-bloggin-neon/70 min-h-96 w-full resize-y border-b bg-transparent py-4 font-mono text-sm leading-7 transition-colors duration-200 outline-none lg:min-h-136"
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
          <div className="flex items-center justify-between gap-4 pt-4">
            <label className="text-bloggin-muted flex items-center gap-3 text-sm">
              <input
                className="border-bloggin-border bg-bloggin-background checked:bg-bloggin-accent checked:border-bloggin-accent accent-bloggin-accent h-5 w-5 rounded-sm border"
                type="checkbox"
                name="published"
                defaultChecked={initialValues?.published ?? false}
              />
              publish
            </label>
            <SubmitButton mode={mode} />
          </div>
        </div>

        <aside className="min-w-0 lg:sticky lg:top-6">
          {/* TODO:add image uploader/preview here */}
          <div className="aspect-3/2 overflow-hidden lg:rounded-xl">
            <Image
              className="h-full w-full object-cover"
              src="https://i.pinimg.com/736x/b1/c6/8a/b1c68add7057994c22ee16e134f55d8f.jpg"
              alt="placeholder"
              width={800}
              height={533}
            />
          </div>
          <MarkdownContent content={content} className="rounded p-4" />
        </aside>
      </form>
      {state.errors?._form?.map((error) => (
        <p key={error} className="text-sm text-red-500!">
          {error}
        </p>
      ))}
      {initialValues && <DeleteButton slug={initialValues.slug} />}
    </div>
  );
}
