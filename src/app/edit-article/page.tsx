import { updateArticle } from "~/server/articles";

export default function EditArticle() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
      <form
        action={async (formData) => {
          "use server";
          await updateArticle("my-pookie-grimes", formData);
        }}
        className="flex w-full max-w-xl flex-col gap-4"
      >
        <div className="flex flex-col gap-2">
          <label htmlFor="title" className="font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            required
            className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
            placeholder="My first article"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="imageUrl" className="font-medium">
            Image URL
          </label>
          <input
            id="imageUrl"
            name="imageUrl"
            className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
            placeholder="https://i.pinimg.com/564x/a3/cd/48/a3cd481c692c8f07479d2232fb08dc67.jpg"
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="content" className="font-medium">
            Content
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={8}
            className="rounded-md border border-white/20 bg-white/10 px-3 py-2 text-white"
            placeholder="Write article content here..."
          />
        </div>

        <label className="flex items-center gap-2">
          <input name="published" type="checkbox" />
          <span>Publish now</span>
        </label>

        <button
          type="submit"
          className="rounded-full bg-white/10 px-10 py-3 font-semibold transition hover:bg-white/20"
        >
          update Article
        </button>
      </form>
    </div>
  );
}
