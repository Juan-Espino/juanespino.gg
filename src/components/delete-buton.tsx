"use client";
import { useState } from "react";
import { deleteArticleAction } from "~/server/actions";

type DeleteButtonProps = {
  slug: string;
};
export default function DeleteButton({ slug }: DeleteButtonProps) {
  const [confirming, setConfirming] = useState(false);

  // TODO:make this a shadcn alert dialog
  if (confirming) {
    return (
      <form action={() => deleteArticleAction(slug)}>
        <p>delete this article?</p>
        <button type="submit">yes, delete</button>
        <button onClick={() => setConfirming(false)}>cancle</button>
      </form>
    );
  }
  return (
    <button onClick={() => setConfirming(true)} className="text-red-500">
      delete
    </button>
  );
}
