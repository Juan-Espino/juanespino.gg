import { notFound } from "next/navigation";
import {
  markdownFixtures,
  type MarkdownFixtureName,
} from "~/lib/markdown-fixtures";
import MarkdownTestView from "./markdown-test-view";

// Dev-only page: renders one fixture as the published article and in the
// live-preview editor, one above the other, for the Playwright tests.
export default async function MarkdownTestPage({
  searchParams,
}: {
  searchParams: Promise<{ fixture?: string; image?: string }>;
}) {
  if (process.env.NODE_ENV === "production") notFound();

  const { fixture = "paragraph", image } = await searchParams;
  if (!(fixture in markdownFixtures)) notFound();

  return (
    <MarkdownTestView
      content={markdownFixtures[fixture as MarkdownFixtureName]}
      withHeaderImage={image === "1"}
    />
  );
}
