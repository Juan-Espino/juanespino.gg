"use client";
import Image from "next/image";
import { useState } from "react";
import LiveMarkdownEditor from "~/components/live-markdown/live-markdown-editor";
import MarkdownContent from "~/components/markdown-content";
import { fixtureHeaderImage } from "~/lib/markdown-fixtures";
import { markdownStyles } from "~/lib/markdown-styles";

function HeaderImage() {
  return (
    <div className={markdownStyles.headerImage} data-testid="header-image">
      <Image
        className="h-full w-full object-cover"
        src={fixtureHeaderImage}
        alt="header"
        width={800}
        height={533}
        priority
      />
    </div>
  );
}

export default function MarkdownTestView({
  content,
  withHeaderImage,
}: {
  content: string;
  withHeaderImage: boolean;
}) {
  const [value, setValue] = useState(content);

  return (
    <div className="flex flex-col gap-16 py-8">
      {/* Same structure as the desktop article body. */}
      <section data-testid="published" className="w-full">
        <div>
          {withHeaderImage && <HeaderImage />}
          <MarkdownContent content={content} />
        </div>
      </section>

      <section data-testid="editor" className="w-full">
        <LiveMarkdownEditor
          initialValue={content}
          onChange={setValue}
          floatContent={withHeaderImage ? <HeaderImage /> : undefined}
        />
      </section>

      <pre data-testid="editor-value" className="hidden">
        {value}
      </pre>
    </div>
  );
}
