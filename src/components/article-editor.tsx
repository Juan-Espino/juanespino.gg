"use client";
import {
  useActionState,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useTransition,
} from "react";
import Image from "next/image";
import { ImageUp } from "lucide-react";
import { type ArticleFormState } from "~/server/articles";
import { deleteUploadedImage } from "~/server/actions";
import { useAutosave, type AutosaveValues } from "~/hooks/use-autosave";
import { markdownStyles } from "~/lib/markdown-styles";
import { cn } from "~/lib/utils";
import { formattedDate } from "~/utils/helpers";
import { useUploadThing } from "~/utils/uploadthing";
import AutosaveStatusLabel from "./autosave-status";
import { Spinner } from "./ui/spinner";
import DeleteButton from "./delete-button";
import ImageDropZone from "./image-drop-zone";
import { useImageCropper } from "./image-cropper";
import LiveMarkdownEditor from "./live-markdown/live-markdown-editor";
import SubmitButton from "./submit-button";
import { Switch } from "./ui/switch";

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
    id: number;
    title: string;
    content: string;
    imageUrl: string | null;
    imageKey: string | null;
    slug: string;
    published: boolean;
    createdAt: Date;
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
  // Refs let the page-exit cleanup read the latest values without re-binding.
  const unsavedImageKeyRef = useRef("");
  const isSubmittingRef = useRef(false);
  const discardedImageKeyRef = useRef("");

  const [title, setTitle] = useState(initialValues?.title ?? "");
  const [content, setContent] = useState(initialValues?.content ?? "");
  const [imageUrl, setImageUrl] = useState(initialValues?.imageUrl ?? "");
  const [imageKey, setImageKey] = useState(initialValues?.imageKey ?? "");
  const mobileTitleRef = useRef<HTMLTextAreaElement>(null);
  const wasPublished = initialValues?.published ?? false;
  const [publish, setPublish] = useState(wasPublished);
  // The image key stored in the database; auto-save moves it forward.
  const [savedImageKey, setSavedImageKey] = useState(
    initialValues?.imageKey ?? "",
  );

  const autosave = useAutosave({
    enabled: !initialValues?.published,
    initialId: initialValues?.id,
    initialSlug: initialValues?.slug,
    values: { title, content, imageUrl, imageKey },
    onSaved: (saved: AutosaveValues) => setSavedImageKey(saved.imageKey),
  });

  // Manual save: let any auto-save in flight finish first so a new draft
  // is submitted with its id (updated, not inserted twice).
  const [state, formAction] = useActionState(
    async (prevState: ArticleFormState, formData: FormData) => {
      isSubmittingRef.current = true;
      const id = await autosave.pause();
      if (id) formData.set("id", String(id));
      let result: ArticleFormState;
      try {
        result = await action(prevState, formData);
      } catch (error) {
        isSubmittingRef.current = false;
        autosave.resume();
        throw error;
      }
      // Returned instead of redirecting: the save failed, so the upload is
      // unsaved again and auto-save picks back up.
      isSubmittingRef.current = false;
      autosave.resume();
      return result;
    },
    initialArticleFormState,
  );
  const [isRemovingImage, startRemovingImage] = useTransition();
  const [imageRemovalError, setImageRemovalError] = useState<string | null>(
    null,
  );
  const currentImageIsUnsaved = imageKey !== "" && imageKey !== savedImageKey;

  useEffect(() => {
    unsavedImageKeyRef.current = currentImageIsUnsaved ? imageKey : "";
  }, [currentImageIsUnsaved, imageKey]);

  // Delete an unsaved upload when the editor is left without saving: tab
  // close, refresh, external navigation (pagehide) or in-app navigation
  // (unmount). The server refuses if a saved article uses the key.
  useEffect(() => {
    function discardUnsavedUpload() {
      const key = unsavedImageKeyRef.current;
      if (!key || isSubmittingRef.current) return;
      if (discardedImageKeyRef.current === key) return;

      discardedImageKeyRef.current = key;
      navigator.sendBeacon(
        "/api/uploads/discard",
        new Blob([JSON.stringify({ imageKey: key })], {
          type: "application/json",
        }),
      );
    }

    // Restored from the back/forward cache: the upload was discarded, so
    // fall back to the saved image instead of showing a deleted file.
    function handlePageShow(event: PageTransitionEvent) {
      const key = discardedImageKeyRef.current;
      if (!event.persisted || !key || unsavedImageKeyRef.current !== key) {
        return;
      }
      setImageUrl(initialValues?.imageUrl ?? "");
      setImageKey(initialValues?.imageKey ?? "");
    }

    window.addEventListener("pagehide", discardUnsavedUpload);
    window.addEventListener("pageshow", handlePageShow);
    return () => {
      window.removeEventListener("pagehide", discardUnsavedUpload);
      window.removeEventListener("pageshow", handlePageShow);
      discardUnsavedUpload();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  function handleUploaded(file: { ufsUrl?: string; key?: string } | undefined) {
    setImageRemovalError(null);
    if (file?.ufsUrl) setImageUrl(file.ufsUrl);
    if (file?.key) setImageKey(file.key);
  }

  const { startUpload, isUploading } = useUploadThing("articleImage", {
    onClientUploadComplete: (res) => handleUploaded(res[0]),
    onUploadError: (error) => setImageRemovalError(error.message),
  });
  const { prepare, cropper } = useImageCropper();
  // Local preview of the cropped image while it uploads.
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const busyWithImage = isUploading || uploadPreview !== null;

  // Every header image: crop to 3:2 if needed, then upload the result.
  async function addHeaderImage(file: File) {
    if (busyWithImage) return;
    setImageRemovalError(null);
    let preview: string | null = null;
    try {
      const ready = await prepare(file);
      if (!ready) return; // cancelled
      preview = URL.createObjectURL(ready);
      setUploadPreview(preview);
      await startUpload([ready]);
    } catch (error) {
      setImageRemovalError(
        error instanceof Error ? error.message : "Couldn't add that image",
      );
    } finally {
      if (preview) {
        URL.revokeObjectURL(preview);
        setUploadPreview(null);
      }
    }
  }

  // Pasting an image anywhere in the editor sets the header image.
  function handlePasteImage(files: File[]) {
    const file = files[0];
    if (imageUrl || busyWithImage || !file) return false;
    void addHeaderImage(file);
    return true;
  }

  const submitLabel = publish
    ? wasPublished
      ? "update"
      : "publish"
    : wasPublished
      ? "unpublish"
      : "save draft";

  // The mobile title grows with its text, like the published hero title.
  useLayoutEffect(() => {
    const el = mobileTitleRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight}px`;
  }, [title]);

  const date = formattedDate(initialValues?.createdAt ?? new Date());
  const deleteSlug = autosave.slug;

  const fieldErrors = (errors: string[] | undefined) =>
    errors?.map((error) => (
      <p key={error} className="text-sm text-red-500!">
        {error}
      </p>
    ));

  const imageErrors = (
    <>
      {fieldErrors(state.errors?.imageUrl)}
      {fieldErrors(state.errors?.imageKey)}
      {imageRemovalError ? (
        <p className="text-sm text-red-500!">{imageRemovalError}</p>
      ) : null}
    </>
  );

  const changeImageButton = (className?: string) => (
    <button
      type="button"
      className={cn(
        "bg-bloggin-background/80 text-bloggin-foreground hover:text-bloggin-accent disabled:text-bloggin-muted/50 flex cursor-pointer items-center gap-1.5 rounded px-3 py-1.5 text-xs font-semibold backdrop-blur transition-colors disabled:cursor-not-allowed",
        className,
      )}
      disabled={!imageKey || isRemovingImage}
      onClick={handleChangeImage}
    >
      <ImageUp className="size-3.5" aria-hidden />
      {isRemovingImage ? "removing..." : "change image"}
    </button>
  );

  // Desktop: floated inside the editor so the text wraps around it, in the
  // same box as the published article's header image.
  const desktopImage = (
    <div className={cn(markdownStyles.headerImage, "group relative")}>
      {imageUrl ? (
        <>
          <Image
            className="h-full w-full object-cover"
            src={imageUrl}
            alt="article image"
            width={800}
            height={533}
            loading="eager"
            sizes="492px"
          />
          {changeImageButton(
            "absolute right-3 bottom-3 opacity-0 group-hover:opacity-100 focus-visible:opacity-100",
          )}
        </>
      ) : uploadPreview ? (
        <UploadingPreview src={uploadPreview} />
      ) : (
        <ImageDropZone onFile={(file) => void addHeaderImage(file)} />
      )}
    </div>
  );

  return (
    <form action={formAction} className="flex w-full flex-col">
      {cropper}
      <input type="hidden" name="id" value={autosave.id ?? ""} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="content" value={content} />
      <input type="hidden" name="imageUrl" value={imageUrl} />
      <input type="hidden" name="imageKey" value={imageKey} />

      {/* Action bar: stays in reach however long the article gets. */}
      <div className="bg-bloggin-background/85 border-bloggin-border/30 sticky top-0 z-30 flex items-center justify-between gap-4 border-b px-4 py-3 backdrop-blur md:px-0">
        <div className="flex items-center gap-2">
          <p className="text-bloggin-muted text-sm max-sm:hidden">
            {mode === "create" ? "new article" : "editing article"}
          </p>
          <AutosaveStatusLabel status={autosave.status} />
        </div>
        <div className="flex items-center gap-4">
          <label className="group/publish text-bloggin-muted has-[[data-state=checked]]:text-bloggin-foreground hover:text-bloggin-foreground flex cursor-pointer items-center gap-3 text-sm transition-colors">
            <Switch
              className="group-hover/publish:data-checked:bg-white group-hover/publish:data-unchecked:bg-bloggin-muted/60"
              name="published"
              checked={publish}
              onCheckedChange={setPublish}
            />
            publish
          </label>
          <SubmitButton label={submitLabel} />
        </div>
      </div>

      {/* Mobile: the published hero, with the title typed over the image. */}
      <div className="relative aspect-3/2 overflow-hidden md:hidden">
        {imageUrl ? (
          <Image
            className="h-full w-full object-cover"
            src={imageUrl}
            alt="article image"
            width={800}
            height={533}
            loading="eager"
            sizes="100vw"
          />
        ) : uploadPreview ? (
          // eslint-disable-next-line @next/next/no-img-element -- local blob preview
          <img
            className="h-full w-full object-cover"
            src={uploadPreview}
            alt=""
          />
        ) : null}
        <div className="pointer-events-none absolute -inset-1 bg-black/70 backdrop-blur-[2px]" />
        {!imageUrl && !busyWithImage ? (
          // Invisible full-size tap target: anywhere outside the title.
          <ImageDropZone
            variant="overlay"
            onFile={(file) => void addHeaderImage(file)}
          />
        ) : null}
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center gap-4 px-6">
          <textarea
            ref={mobileTitleRef}
            className="pointer-events-auto w-full max-w-[18rem] resize-none overflow-hidden bg-transparent text-center text-3xl leading-tight font-bold text-balance outline-none placeholder:text-white/40 sm:text-4xl"
            rows={1}
            value={title}
            onChange={(event) =>
              setTitle(event.target.value.replace(/\n/g, " "))
            }
            placeholder="title"
            aria-label="title"
          />
          <span className="before:bg-bloggin-accent relative before:absolute before:-inset-1 before:-skew-y-3">
            <span className="text-bloggin-background! relative text-sm whitespace-nowrap sm:text-base">
              {date}
            </span>
          </span>
          {!imageUrl ? (
            <p className="text-bloggin-muted text-xs">
              {busyWithImage ? "uploading..." : "tap, drop or paste an image"}
            </p>
          ) : null}
        </div>
        {imageUrl ? changeImageButton("absolute right-3 bottom-3 z-20") : null}
      </div>

      <div className="flex w-full flex-col px-4 pt-4 md:px-0 md:pt-8">
        {/* Desktop header: same as the published article. */}
        <header className="border-bloggin-border/40 mb-4 border-b pb-4 max-md:hidden">
          <input
            className="placeholder:text-bloggin-muted/50 mb-2 w-full bg-transparent py-2 text-4xl font-bold outline-none"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="title"
            aria-label="title"
          />
          <p className="text-bloggin-muted/70! text-sm whitespace-nowrap">
            {date}
          </p>
        </header>
        {fieldErrors(state.errors?.title)}
        <div className="md:hidden">{imageErrors}</div>

        <LiveMarkdownEditor
          initialValue={initialValues?.content ?? ""}
          onChange={setContent}
          floatContent={desktopImage}
          floatHostClassName="max-md:hidden"
          onPasteImage={handlePasteImage}
          placeholder="write your article in Markdown..."
          className="[&_.cm-content]:min-h-[60vh]"
        />
        {fieldErrors(state.errors?.content)}
        <div className="max-md:hidden">{imageErrors}</div>
        {fieldErrors(state.errors?._form)}

        {deleteSlug ? (
          <div className="flex justify-center py-10">
            <DeleteButton slug={deleteSlug} />
          </div>
        ) : null}
      </div>
    </form>
  );
}

function UploadingPreview({ src }: { src: string }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl">
      {/* eslint-disable-next-line @next/next/no-img-element -- local blob preview */}
      <img className="h-full w-full object-cover" src={src} alt="" />
      <div className="text-bloggin-foreground absolute inset-0 flex items-center justify-center gap-2 bg-black/50 text-sm font-semibold">
        <Spinner className="size-4" aria-hidden />
        uploading...
      </div>
    </div>
  );
}
