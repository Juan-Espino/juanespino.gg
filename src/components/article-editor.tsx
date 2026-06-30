"use client";
import { useActionState, useState, useTransition } from "react";
import { type ArticleFormState } from "~/server/articles";
import SubmitButton from "./submit-button";
import MarkdownContent from "./markdown-content";
import DeleteButton from "./delete-buton";
import Image from "next/image";
import { UploadDropzone } from "~/utils/uploadthing";
import { deleteUploadedImage } from "~/server/actions";

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
    imageKey: string | null;
    slug: string;
    published: boolean;
  };
};

export async function deleteUploadedImageAction(imageKey: string) {
  return deleteUploadedImage(imageKey);
}

export default function ArticleEditor({
  mode,
  action,
  initialValues,
}: ArticleEditorProps) {
  const [state, formAction] = useActionState(action, initialArticleFormState);
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? "");
  const [imageKey, setImageKey] = useState(initialValues?.imageKey ?? "");
  const [isRemovingImage, startRemovingImage] = useTransition();
  const [imageRemovalError, setImageRemovalError] = useState<string | null>(
    null,
  );
  const savedImageKey = initialValues?.imageKey ?? "";
  const currentImageIsUnsaved = imageKey !== "" && imageKey !== savedImageKey;

  function handleChangeImage() {
    if (!imageKey || isRemovingImage) return;

    setImageRemovalError(null);

    if (!currentImageIsUnsaved) {
      setImageUrl("");
      setImageKey("");
      return;
    }

    const keyToDelete = imageKey;

    startRemovingImage(async () => {
      const result = await deleteUploadedImageAction(keyToDelete);

      if (!result.success) {
        setImageRemovalError(
          result.message ?? "Failed to delete uploaded image",
        );
        return;
      }

      setImageUrl("");
      setImageKey("");
    });
  }

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
          <input type="hidden" name="imageUrl" value={imageUrl} />
          <input type="hidden" name="imageKey" value={imageKey} />

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

        <aside className="sticky top-6 min-w-0 lg:flex lg:flex-col lg:gap-4">
          {imageUrl ? (
            <div className="flex flex-col gap-3">
              <div className="aspect-3/2 overflow-hidden lg:rounded-xl">
                <Image
                  className="h-full w-full object-cover"
                  src={imageUrl}
                  alt="article image preview"
                  width={800}
                  height={533}
                />
              </div>
              <button
                type="button"
                className="border-bloggin-border/40 text-bloggin-muted hover:border-bloggin-accent/70 hover:text-bloggin-foreground disabled:text-bloggin-muted/50 rounded border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed"
                disabled={!imageKey || isRemovingImage}
                onClick={handleChangeImage}
              >
                {isRemovingImage ? "removing image..." : "change image"}
              </button>
            </div>
          ) : (
            // TODO: shadcn toast is uploadthing gives error from upload
            <UploadDropzone
              endpoint="articleImage"
              className="border-bloggin-border/40 bg-bloggin-background/60 hover:border-bloggin-accent/70 aspect-3/2 rounded-xl border border-dashed px-6 py-8 transition-colors"
              appearance={{
                uploadIcon: "text-bloggin-muted size-10",
                label:
                  "text-bloggin-foreground text-sm font-semibold hover:text-bloggin-accent ",
                allowedContent: "text-bloggin-muted/70 text-xs",
                button:
                  "bg-bloggin-accent text-bloggin-background hover:bg-bloggin-foreground h-9 rounded px-4 text-sm font-bold transition-colors disabled:bg-bloggin-muted",
              }}
              content={{
                label: "drop image or click here!",
                allowedContent: "Images up to 4MB. Recommended 1200 x 800.",
                button({ ready, isUploading, files }) {
                  if (!ready) return "loading...";
                  if (isUploading) return "uploading...";
                  if (files.length > 0) return `upload ${files.length} image`;
                  return "waiting for file... ";
                },
              }}
              onClientUploadComplete={(res) => {
                const uploadedFile = res[0];

                setImageRemovalError(null);
                if (uploadedFile?.ufsUrl) setImageUrl(uploadedFile.ufsUrl);
                if (uploadedFile?.key) setImageKey(uploadedFile.key);
              }}
              onUploadError={(error) => {
                console.error(error);
              }}
            />
          )}
          {state.errors?.imageUrl?.map((error) => (
            <p key={error} className="text-sm text-red-500!">
              {error}
            </p>
          ))}
          {state.errors?.imageKey?.map((error) => (
            <p key={error} className="text-sm text-red-500!">
              {error}
            </p>
          ))}
          {imageRemovalError ? (
            <p className="text-sm text-red-500!">{imageRemovalError}</p>
          ) : null}
          <MarkdownContent
            content={content}
            className="border-bloggin-border/40 rounded border p-4"
          />
        </aside>
      </form>
      {state.errors?._form?.map((error) => (
        <p key={error} className="text-sm text-red-500!">
          {error}
        </p>
      ))}
      {initialValues && (
        <div className="flex justify-center">
          <DeleteButton slug={initialValues.slug} />
        </div>
      )}
    </div>
  );
}
