"use server";
import { deleteArticle, removeArticleImage } from "./articles";

export async function deleteArticleAction(slug: string) {
  await deleteArticle(slug);
}

export async function removeArticleImageAction(
  slug: string | null,
  imageKey: string,
) {
  return removeArticleImage(slug, imageKey);
}
