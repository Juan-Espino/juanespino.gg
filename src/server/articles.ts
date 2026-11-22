"use server";
import { z } from "zod";
import { getIsAdmin } from "./better-auth/admin";
import { getSession } from "./better-auth/server";
import { articles } from "./db/app-schema";
import { redirect } from "next/navigation";
import { db } from "./db";
import { and, desc, eq, ne } from "drizzle-orm";
import { UTApi } from "uploadthing/server";
import { blogginRoutes } from "~/lib/routes";

const utapi = new UTApi();

export async function deleteUploadThingFile(imageKey: string) {
  try {
    await utapi.deleteFiles(imageKey);
  } catch (error) {
    console.error("Failed to delete UploadThing file", error);
  }
}

/**
 * Deletes an uploaded file only if no saved article references it.
 * Guards unsaved-upload cleanup against deleting a live article image.
 */
export async function deleteUnusedUploadThingFile(imageKey: string) {
  const [inUse] = await db
    .select({ id: articles.id })
    .from(articles)
    .where(eq(articles.imageKey, imageKey))
    .limit(1);

  if (inUse) return false;

  await deleteUploadThingFile(imageKey);
  return true;
}

export type ArticleFormState = {
  success: boolean;
  message?: string;
  errors?: {
    title?: string[];
    imageUrl?: string[];
    imageKey?: string[];
    content?: string[];
    published?: string[];
    _form?: string[];
  };
};

export type ArticleImageRemovalState = {
  success: boolean;
  message?: string;
};

export type ArticleLinks = {
  title: string;
  slug: string;
  createdAt: Date;
};

const createArticleSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "title is required")
      .max(256, "Title must be 256 characters or fewer."),
    content: z.string().trim(),
    imageUrl: z.string().url("enter a valid image URL").optional(),
    imageKey: z.string().trim().min(1, "image key is required").optional(),
    published: z.boolean(),
  })
  .superRefine((input, ctx) => {
    // Drafts only need a title; publishing needs content and an image too.
    if (input.published && !input.content) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["content"],
        message: "published articles require content",
      });
    }

    if (input.published && !input.imageUrl) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["imageUrl"],
        message: "published articles require an image",
      });
    }

    if (input.published && !input.imageKey) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["imageKey"],
        message: "published articles require an uploaded image key",
      });
    }
  });

function getFormString(formData: FormData, key: string) {
  const value = formData.get(key);

  if (typeof value !== "string") return "";

  return value.trim();
}

function getOptionalFormString(formData: FormData, key: string) {
  const value = getFormString(formData, key);

  return value === "" ? undefined : value;
}

function getFormArticleId(formData: FormData) {
  const id = Number(getFormString(formData, "id"));

  return Number.isInteger(id) && id > 0 ? id : undefined;
}

function getCreateArticleInput(formData: FormData) {
  return {
    title: getFormString(formData, "title"),
    content: getFormString(formData, "content"),
    imageUrl: getOptionalFormString(formData, "imageUrl"),
    imageKey: getOptionalFormString(formData, "imageKey"),
    published: formData.get("published") === "on",
  };
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function articleSlugExists(slug: string, ignoredArticleId?: number) {
  const [article] = ignoredArticleId
    ? await db
        .select({ id: articles.id })
        .from(articles)
        .where(and(eq(articles.slug, slug), ne(articles.id, ignoredArticleId)))
        .limit(1)
    : await db
        .select({ id: articles.id })
        .from(articles)
        .where(eq(articles.slug, slug))
        .limit(1);

  return !!article;
}

async function getUniqueArticleSlug(title: string, ignoredArticleId?: number) {
  const baseSlug = slugify(title);

  let slug = baseSlug;
  let suffix = 2;

  while (await articleSlugExists(slug, ignoredArticleId)) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  return slug;
}

async function getArticleById(id: number) {
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.id, id))
    .limit(1);

  return article ?? null;
}

/**
 * Manual save for both the create and edit pages. A form with an `id`
 * (an edited article, or a new one that was already auto-saved) updates
 * that row; otherwise a new article is inserted.
 */
export async function saveArticle(
  _prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const session = await getSession();

  if (!session?.user.id) {
    throw new Error("Failed, user is not signed in");
  }

  if (!(await getIsAdmin())) {
    throw new Error("Failed, user is not allowed to save articles");
  }

  const result = createArticleSchema.safeParse(getCreateArticleInput(formData));

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const input = result.data;
  const articleId = getFormArticleId(formData);

  if (articleId) {
    const article = await getArticleById(articleId);

    if (!article) {
      throw new Error("Failed, article does not exist");
    }

    const newSlug = await getUniqueArticleSlug(input.title, article.id);
    const previousImageKey = article.imageKey;
    const nextImageKey = input.imageKey ?? null;

    await db
      .update(articles)
      .set({
        title: input.title,
        content: input.content,
        slug: newSlug,
        imageUrl: input.imageUrl ?? null,
        imageKey: nextImageKey,
        published: input.published,
      })
      .where(eq(articles.id, article.id));

    if (previousImageKey && previousImageKey !== nextImageKey) {
      await deleteUploadThingFile(previousImageKey);
    }

    redirect(`${blogginRoutes.article(newSlug)}?updated=1`);
  }

  const slug = await getUniqueArticleSlug(input.title);

  await db.insert(articles).values({
    authorId: session.user.id,
    title: input.title,
    content: input.content,
    slug: slug,
    imageUrl: input.imageUrl ?? null,
    imageKey: input.imageKey ?? null,
    published: input.published,
  });

  redirect(`${blogginRoutes.article(slug)}?created=1`);
}

const autosaveDraftSchema = z.object({
  id: z.number().int().positive().optional(),
  title: z
    .string()
    .trim()
    .min(1, "title is required")
    .max(256, "Title must be 256 characters or fewer."),
  content: z.string(),
  imageUrl: z.string().url().optional(),
  imageKey: z.string().trim().min(1).optional(),
});

export type AutosaveDraftInput = z.input<typeof autosaveDraftSchema>;

export type AutosaveDraftResult =
  | { ok: true; id: number; slug: string }
  | {
      ok: false;
      // unauthorized: stop retrying; published/invalid/not_found: stop
      // auto-saving; error: transient, safe to retry.
      reason: "unauthorized" | "invalid" | "published" | "not_found" | "error";
    };

/**
 * Auto-save for drafts. Never touches `published`, and only writes rows
 * that are still drafts. The first save (no `id`) creates the draft.
 */
export async function autosaveDraft(
  rawInput: AutosaveDraftInput,
): Promise<AutosaveDraftResult> {
  try {
    const session = await getSession();

    if (!session?.user.id || !(await getIsAdmin())) {
      return { ok: false, reason: "unauthorized" };
    }

    const parsed = autosaveDraftSchema.safeParse(rawInput);

    if (!parsed.success) {
      return { ok: false, reason: "invalid" };
    }

    const input = parsed.data;

    if (!input.id) {
      const slug = await getUniqueArticleSlug(input.title);
      const [created] = await db
        .insert(articles)
        .values({
          authorId: session.user.id,
          title: input.title,
          content: input.content,
          slug,
          imageUrl: input.imageUrl ?? null,
          imageKey: input.imageKey ?? null,
          published: false,
        })
        .returning({ id: articles.id });

      if (!created) return { ok: false, reason: "error" };

      return { ok: true, id: created.id, slug };
    }

    const article = await getArticleById(input.id);

    if (!article) return { ok: false, reason: "not_found" };
    if (article.published) return { ok: false, reason: "published" };

    // Drafts aren't public, so the slug follows the title. Only look up a
    // new one when the title actually changed.
    const slug =
      article.title === input.title
        ? article.slug
        : await getUniqueArticleSlug(input.title, article.id);
    const nextImageKey = input.imageKey ?? null;

    const [updated] = await db
      .update(articles)
      .set({
        title: input.title,
        content: input.content,
        slug,
        imageUrl: input.imageUrl ?? null,
        imageKey: nextImageKey,
      })
      .where(and(eq(articles.id, article.id), eq(articles.published, false)))
      .returning({ id: articles.id });

    // Published between the read and the write.
    if (!updated) return { ok: false, reason: "published" };

    if (article.imageKey && article.imageKey !== nextImageKey) {
      await deleteUploadThingFile(article.imageKey);
    }

    return { ok: true, id: article.id, slug };
  } catch (error) {
    console.error("Failed to auto-save draft", error);
    return { ok: false, reason: "error" };
  }
}

export async function getRecentPublishedArticle() {
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.published, true))
    .orderBy(desc(articles.createdAt))
    .limit(1);
  return article ?? null;
}

export type ArticleCard = {
  title: string;
  slug: string;
  imageUrl: string | null;
};

export async function getLatestPublishedArticleCards(
  excludedSlug?: string,
  limit = 9,
): Promise<ArticleCard[]> {
  return db
    .select({
      title: articles.title,
      slug: articles.slug,
      imageUrl: articles.imageUrl,
    })
    .from(articles)
    .where(
      excludedSlug
        ? and(eq(articles.published, true), ne(articles.slug, excludedSlug))
        : eq(articles.published, true),
    )
    .orderBy(desc(articles.createdAt))
    .limit(Math.min(Math.max(limit, 1), 50));
}

export async function getPublishedArticleBySlug(slug: string) {
  const [article] = await db
    .select()
    .from(articles)
    .where(and(eq(articles.slug, slug), eq(articles.published, true)))
    .limit(1);

  return article ?? null;
}

export async function getArticleBySlugForAdmin(slug: string) {
  if (!(await getIsAdmin())) {
    throw new Error("Unauthorized");
  }

  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.slug, slug))
    .limit(1);

  return article ?? null;
}

export async function removeArticleImage(
  slug: string | null,
  imageKey: string,
): Promise<ArticleImageRemovalState> {
  if (!(await getIsAdmin())) {
    throw new Error("Unauthorized");
  }

  if (!imageKey) {
    return {
      success: false,
      message: "No image to remove",
    };
  }

  if (slug) {
    const article = await getArticleBySlugForAdmin(slug);

    if (!article) {
      throw new Error("Failed, article does not exist");
    }

    if (article.imageKey && article.imageKey !== imageKey) {
      return {
        success: false,
        message: "Image has changed. Refresh and try again.",
      };
    }

    if (article.imageKey === imageKey) {
      await db
        .update(articles)
        .set({
          imageUrl: null,
          imageKey: null,
        })
        .where(eq(articles.id, article.id));
    }
  }

  await deleteUploadThingFile(imageKey);

  return {
    success: true,
  };
}

export async function deleteArticle(slug: string) {
  const article = await getArticleBySlugForAdmin(slug);

  if (!article) {
    throw new Error("Failed, article does not exist");
  }

  await db.delete(articles).where(eq(articles.id, article.id));

  if (article.imageKey) {
    await deleteUploadThingFile(article.imageKey);
  }

  redirect(`${blogginRoutes.home}?deleted=1`);
}

//for 'all' articles page
export async function getPublishedArticleLinks(limit = 50) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);

  return db
    .select({
      title: articles.title,
      slug: articles.slug,
      createdAt: articles.createdAt,
    })
    .from(articles)
    .where(eq(articles.published, true))
    .orderBy(desc(articles.createdAt))
    .limit(safeLimit);
}

export async function getDraftArticleLinksForAdmin(limit = 50) {
  if (!(await getIsAdmin())) {
    throw new Error("Unauthorized");
  }

  const safeLimit = Math.min(Math.max(limit, 1), 50);

  return db
    .select({
      title: articles.title,
      slug: articles.slug,
      createdAt: articles.createdAt,
    })
    .from(articles)
    .where(eq(articles.published, false))
    .orderBy(desc(articles.createdAt))
    .limit(safeLimit);
}
