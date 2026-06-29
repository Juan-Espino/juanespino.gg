import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MarkdownContentProps = {
  content: string;
  className?: string;
};
export default function MarkdownContent({
  content,
  className,
}: MarkdownContentProps) {
  return (
    <div className={className ?? ""}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => (
            <p className="text-bloggin-muted mb-5 text-lg leading-8 font-semibold">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="text-bloggin-accent font-bold">
              {children}
            </strong>
          ),
          h1: ({ children }) => (
            <h1 className="text-bloggin-foreground/85! mb-4 text-4xl font-bold">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-bloggin-foreground/85! mb-3 text-2xl font-bold">
              {children}
            </h2>
          ),
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-bloggin-neon underline underline-offset-4"
              target="_blank"
              rel="noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
