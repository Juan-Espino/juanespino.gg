"use client";
import { useState } from "react";
import { deleteArticleAction } from "~/server/actions";
import { Button } from "./ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog";
import { Trash2Icon } from "lucide-react";

type DeleteButtonProps = {
  slug: string;
};
export default function DeleteButton({ slug }: DeleteButtonProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">delete</Button>
      </AlertDialogTrigger>

      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>delete article?</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription className="text-center">
          this will delete the article and its image
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogCancel className="w-full" variant="outline">
            cancel
          </AlertDialogCancel>
          <form action={deleteArticleAction.bind(null, slug)}>
            <Button className="w-full" type="submit" variant="destructive">
              yes, delete
            </Button>
          </form>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
