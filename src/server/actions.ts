import { deleteArticle } from "./articles";

export async function deleteArticleAction(slug: string) {
  await deleteArticle(slug);
}
