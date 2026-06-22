import { getSession } from "~/server/better-auth/server";
import { getIsAdmin } from "~/server/better-auth/admin";
import { db } from "~/server/db";
import { articles } from "~/server/db/app-schema";
import { redirect } from "next/navigation";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") {
    return "";
  }

  return value.trim();
}
export default function CreateArticleForm() {
  async function createArticle(formData: FormData) {
    "use server";

    const session = await getSession();
    const isAdmin = await getIsAdmin();

    if (!session?.user?.id || !isAdmin) {
      throw new Error("Unauthorized");
    }

    const title = getFormString(formData, "title");
    const content = getFormString(formData, "content");
    const imageUrl = getFormString(formData, "imageUrl");
    const published = formData.get("published") === "on";

    if (!title) {
      throw new Error("Title is required");
    }

    if (!content) {
      throw new Error("Content is required");
    }

    const slug = slugify(title);

    if (!slug) {
      throw new Error("Slug could not be generated");
    }

    await db.insert(articles).values({
      authorId: session.user.id,
      title,
      slug,
      imageUrl: imageUrl || null,
      content,
      published,
    });

    redirect("/");
  }

  return (
    <form
      action={createArticle}
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
        Create Article
      </button>
    </form>
  );
}
