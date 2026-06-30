"use server";
import {
  deleteArticle,
  deleteUploadThingFile,
  removeArticleImage,
  type ArticleImageRemovalState,
} from "./articles";
import { getIsAdmin } from "./better-auth/admin";

export async function deleteArticleAction(slug: string) {
  await deleteArticle(slug);
}

export async function removeArticleImageAction(
  slug: string | null,
  imageKey: string,
) {
  return removeArticleImage(slug, imageKey);
}

export async function deleteUploadedImage(
  imageKey: string,
): Promise<ArticleImageRemovalState> {
  if (!(await getIsAdmin())) {
    throw new Error("Unauthorized");
  }

  if (!imageKey) {
    return {
      success: false,
      message: "No image to delete",
    };
  }

  await deleteUploadThingFile(imageKey);

  return {
    success: true,
  };
}
