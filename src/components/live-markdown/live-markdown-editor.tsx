"use client";
import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { commonmarkLanguage, markdown } from "@codemirror/lang-markdown";
import { EditorState, StateField } from "@codemirror/state";
import {
  Decoration,
  EditorView,
  WidgetType,
  keymap,
  placeholder as placeholderExtension,
} from "@codemirror/view";
import { GFM } from "@lezer/markdown";
import {
  type ReactNode,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { createPortal } from "react-dom";
import { createRoot } from "react-dom/client";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "~/lib/utils";
import { markdownComponents, rehypeImageSides } from "../markdown-content";
import { livePreview, type RenderMarkdown } from "./live-preview";

// Rich blocks (images, tables) render with the exact published components.
const renderMarkdown: RenderMarkdown = (source, container, side) => {
  const root = createRoot(container);
  root.render(
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      // One image per widget, so its side comes from the editor's count.
      rehypePlugins={side ? [rehypeImageSides(side)] : [rehypeImageSides()]}
      components={{
        ...markdownComponents,
        // Inline: drop the wrapping <p> so the image sits in the line.
        p: ({ children }) => <>{children}</>,
      }}
    >
      {source}
    </ReactMarkdown>,
  );
  return () => setTimeout(() => root.unmount());
};

/**
 * The header image lives inside the editor's content as a zero-height block
 * whose child floats right. Lines that follow wrap around it exactly like
 * the published article, and CodeMirror's height map stays correct because
 * the wrapper itself takes no vertical space.
 */
class FloatWidget extends WidgetType {
  constructor(readonly host: HTMLElement) {
    super();
  }
  eq(other: FloatWidget) {
    return other.host === this.host;
  }
  toDOM() {
    return this.host;
  }
  // eslint-disable-next-line @typescript-eslint/class-literal-property-style -- overrides WidgetType's getter
  get estimatedHeight() {
    return 0;
  }
  // Let buttons and the dropzone inside handle their own events.
  ignoreEvent() {
    return true;
  }
}

function floatField(host: HTMLElement) {
  const deco = Decoration.set([
    Decoration.widget({
      widget: new FloatWidget(host),
      block: true,
      side: -1,
    }).range(0),
  ]);
  return StateField.define({
    create: () => deco,
    update: (value, tr) => (tr.docChanged ? value.map(tr.changes) : value),
    provide: (f) => EditorView.decorations.from(f),
  });
}

const editorTheme = EditorView.theme({
  "&": {
    height: "auto",
    backgroundColor: "transparent",
    color: "inherit",
    fontSize: "inherit",
  },
  "&.cm-focused": { outline: "none" },
  ".cm-scroller": {
    fontFamily: "inherit",
    lineHeight: "inherit",
    overflow: "visible",
  },
  ".cm-content": {
    padding: "0",
    caretColor: "var(--bloggin-foreground)",
  },
  ".cm-line": { padding: "0" },
  // Wrap like the published page: CodeMirror's break-spaces makes the
  // space at a line end take width, so lines broke a word early.
  "&.cm-editor .cm-lineWrapping": {
    whiteSpace: "pre-wrap",
    wordBreak: "normal",
    overflowWrap: "break-word",
  },
  // CodeMirror's cursor helpers next to hidden syntax default to text-top,
  // which stretches large heading lines by a few pixels.
  ".cm-widgetBuffer": { verticalAlign: "top" },
  ".cm-placeholder": { color: "var(--bloggin-muted)" },
});

const noopSubscribe = () => () => undefined;

type LiveMarkdownEditorProps = {
  initialValue: string;
  onChange: (value: string) => void;
  /** Floated at the top right of the text (desktop header image). */
  floatContent?: ReactNode;
  /** Classes for the float's host, e.g. to hide it on mobile. */
  floatHostClassName?: string;
  /** Pasted image files; return true if handled. */
  onPasteImage?: (files: File[]) => boolean;
  placeholder?: string;
  className?: string;
};

export default function LiveMarkdownEditor({
  initialValue,
  onChange,
  floatContent,
  floatHostClassName,
  onPasteImage,
  placeholder,
  className,
}: LiveMarkdownEditorProps) {
  const parentRef = useRef<HTMLDivElement>(null);
  const onChangeRef = useRef(onChange);
  const onPasteImageRef = useRef(onPasteImage);
  const [floatHost] = useState(() => {
    if (typeof document === "undefined") return null;
    const host = document.createElement("div");
    host.className = cn("cm-float-host h-0", floatHostClassName);
    host.contentEditable = "false";
    return host;
  });
  // The portal only exists on the client; render it after hydration.
  const isClient = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );

  useEffect(() => {
    onChangeRef.current = onChange;
    onPasteImageRef.current = onPasteImage;
  });

  useEffect(() => {
    if (!parentRef.current) return;

    const view = new EditorView({
      parent: parentRef.current,
      state: EditorState.create({
        doc: initialValue,
        extensions: [
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          markdown({ base: commonmarkLanguage, extensions: [GFM] }),
          EditorView.lineWrapping,
          EditorView.contentAttributes.of({
            spellcheck: "true",
            "aria-label": "article content",
          }),
          editorTheme,
          livePreview(renderMarkdown),
          floatHost ? floatField(floatHost) : [],
          placeholder ? placeholderExtension(placeholder) : [],
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              onChangeRef.current(update.state.doc.toString());
            }
          }),
          EditorView.domEventHandlers({
            // CodeMirror would insert dropped files as text; images are
            // uploaded through the dropzone instead.
            drop: (event) => {
              if (event.dataTransfer?.files.length) {
                event.preventDefault();
                return true;
              }
              return false;
            },
            paste: (event) => {
              const files = [...(event.clipboardData?.files ?? [])].filter(
                (file) => file.type.startsWith("image/"),
              );
              if (files.length && onPasteImageRef.current?.(files)) {
                event.preventDefault();
                return true;
              }
              return false;
            },
          }),
        ],
      }),
    });

    return () => view.destroy();
    // The editor owns its document after mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <div
        ref={parentRef}
        className={cn("live-markdown-editor min-w-0", className)}
      />
      {isClient && floatHost && floatContent
        ? createPortal(floatContent, floatHost)
        : null}
    </>
  );
}
