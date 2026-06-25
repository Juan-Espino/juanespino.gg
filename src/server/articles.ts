"use server";
import { z } from "zod";
import { getIsAdmin } from "./better-auth/admin";
import { getSession } from "./better-auth/server";
import { articles } from "./db/app-schema";
import { redirect } from "next/navigation";
import { db } from "./db";
import { and, desc, eq, ne } from "drizzle-orm";

const createArticleSchema = z.object({
  title: z.string().trim().min(1).max(256),
  content: z.string().trim().min(1),
  imageUrl: z.string().url().optional(),
  published: z.boolean(),
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

export async function createArticle(formData: FormData) {
  const session = await getSession();

  if (!session?.user.id) {
    throw new Error("Failed, user is not signed in");
  }

  if (!(await getIsAdmin())) {
    throw new Error("Failed, user is not allowed to create articles");
  }

  const result = createArticleSchema.safeParse(getCreateArticleInput(formData));

  if (!result.success) {
    throw new Error("Failed, article is not valid");
  }

  const input = result.data;
  const slug = await getUniqueArticleSlug(input.title);

  await db.insert(articles).values({
    authorId: session.user.id,
    title: input.title,
    content: input.content,
    slug: slug,
    imageUrl: input.imageUrl ?? null,
    published: input.published,
  });

  redirect("/");
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

export async function updateArticle(slug: string, formData: FormData) {
  const article = await getArticleBySlugForAdmin(slug);

  if (!article) {
    throw new Error("Failed, article does not exist");
  }

  const result = createArticleSchema.safeParse(getCreateArticleInput(formData));

  if (!result.success) {
    throw new Error("Failed, article is not valid");
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
      published: input.published,
    })
    .where(eq(articles.id, article.id));

  //TODO:Maybe make this redirect you to /article/new-slug once we have it
  redirect("/");
}

export async function deleteArticle(slug: string) {
  const article = await getArticleBySlugForAdmin(slug);

  if (!article) {
    throw new Error("Failed, article does not exist");
  }

  await db.delete(articles).where(eq(articles.id, article.id));

  redirect("/");
}
