"use server";
import { type ArticleFormState } from "~/server/articles";

// Dev-only stand-in for saveArticle: never touches the database.
export async function devSaveArticle(
  _prevState: ArticleFormState,
  _formData: FormData,
): Promise<ArticleFormState> {
  if (process.env.NODE_ENV === "production") throw new Error("Not available");
  return { success: false, errors: { _form: ["dev page: not saved"] } };
}
