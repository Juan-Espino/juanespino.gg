"use server";
import { z } from "zod";
import { getIsAdmin } from "./better-auth/admin";
import { getSession } from "./better-auth/server";
import { articles } from "./db/app-schema";
import { redirect } from "next/navigation";
import { db } from "./db";
import { and, desc, eq, ne } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

async function deleteUploadThingFile(imageKey: string) {
  try {
    await utapi.deleteFiles(imageKey);
  } catch (error) {
    console.error("Failed to delete UploadThing file", error);
  }
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
    content: z.string().trim().min(1, "content is required"),
    imageUrl: z.string().url("enter a valid image URL").optional(),
    imageKey: z.string().trim().min(1, "image key is required").optional(),
    published: z.boolean(),
  })
  .superRefine((input, ctx) => {
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

export async function createArticle(
  _prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const session = await getSession();

  if (!session?.user.id) {
    throw new Error("Failed, user is not signed in");
  }

  if (!(await getIsAdmin())) {
    throw new Error("Failed, user is not allowed to create articles");
  }

  const result = createArticleSchema.safeParse(getCreateArticleInput(formData));

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const input = result.data;
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

  redirect(`/article/${slug}?created=1`);
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

export async function getLatestPublishedArticles(limit = 10) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const articlesArr = await db
    .select()
    .from(articles)
    .where(eq(articles.published, true))
    .orderBy(desc(articles.createdAt))
    .limit(safeLimit);

  return articlesArr;
}

export async function getLatestPublishedArticlesExcludingSlug(
  slug: string,
  limit = 9,
) {
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const articlesArr = await db
    .select()
    .from(articles)
    .where(and(eq(articles.published, true), ne(articles.slug, slug)))
    .orderBy(desc(articles.createdAt))
    .limit(safeLimit);

  return articlesArr;
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

export async function updateArticle(
  slug: string,
  _prevState: ArticleFormState,
  formData: FormData,
): Promise<ArticleFormState> {
  const article = await getArticleBySlugForAdmin(slug);

  if (!article) {
    throw new Error("Failed, article does not exist");
  }

  const result = createArticleSchema.safeParse(getCreateArticleInput(formData));

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten().fieldErrors,
    };
  }

  const input = result.data;
  const newSlug = await getUniqueArticleSlug(input.title, article.id);

  await db
    .update(articles)
    .set({
      title: input.title,
      content: input.content,
      slug: newSlug,
      imageUrl: input.imageUrl ?? null,
      imageKey: input.imageKey ?? null,
      published: input.published,
    })
    .where(eq(articles.id, article.id));

  if (
    article.imageKey &&
    input.imageKey &&
    article.imageKey !== input.imageKey
  ) {
    await deleteUploadThingFile(article.imageKey);
  }

  redirect(`/article/${newSlug}?updated=1`);
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

  redirect("/");
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
