"use server";
import { z } from "zod";
import { getIsAdmin } from "./better-auth/admin";
import { getSession } from "./better-auth/server";
import { articles } from "./db/app-schema";
import { redirect } from "next/navigation";
import { db } from "./db";
import { desc, eq } from "drizzle-orm";

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
  const slug = slugify(input.title);

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

export async function getLatestArticle() {
  const [article] = await db
    .select()
    .from(articles)
    .where(eq(articles.published, true))
    .orderBy(desc(articles.createdAt))
    .limit(1);
  return article ?? null;
}
