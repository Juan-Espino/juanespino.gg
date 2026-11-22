import { ensureSyntaxTree, syntaxTree } from "@codemirror/language";
import {
  type EditorState,
  type Range,
  StateEffect,
  StateField,
  type Text,
} from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  WidgetType,
} from "@codemirror/view";
import { type SyntaxNode } from "@lezer/common";
import {
  imageClearClass,
  imageSide,
  type ImageSide,
  markdownStyles as md,
} from "~/lib/markdown-styles";

/**
 * Obsidian-style live preview for CodeMirror's Markdown mode.
 *
 * The document is always the raw Markdown string. Decorations style each
 * element like the published article (same classes as MarkdownContent) and
 * hide the syntax characters, except where the cursor is, so you can edit
 * them. Rich blocks (images, tables) render with the published React
 * components through `renderMarkdown`.
 */

export type RenderMarkdown = (
  markdown: string,
  container: HTMLElement,
  /** For a single image: which side it floats to. */
  side?: ImageSide,
) => () => void;

// Class names (all literal so Tailwind picks them up).
const cls = {
  p: md.p.text,
  li: md.li.text,
  h: {
    1: md.h1.text,
    2: md.h2.text,
    3: md.h3.text,
  } as Record<number, string>,
  code: "font-mono",
  strong: md.strong,
  em: "italic",
  del: "line-through",
  link: md.a,
  mark: "cm-md-mark text-bloggin-muted/50",
  collapsed: "cm-md-collapsed h-0 overflow-hidden",
  hr: "cm-md-hr h-0 overflow-hidden border-t border-current",
};

// Gap below each block, as padding on its last line (or the blank line
// after it). Mirrors the published margins.
const gapClass = {
  p: md.p.padding,
  li: md.li.padding,
  h1: md.h1.padding,
  h2: md.h2.padding,
  h3: md.h3.padding,
} as const;

// Blank line heights that equal those gaps.
const blankClass: Record<string, string> = {
  [md.p.padding]: "cm-md-blank h-5",
  [md.h1.padding]: "cm-md-blank h-4",
  [md.h2.padding]: "cm-md-blank h-3",
};

class RenderedWidget extends WidgetType {
  constructor(
    readonly markdown: string,
    readonly render: RenderMarkdown,
    readonly block: boolean,
    readonly side?: ImageSide,
  ) {
    super();
  }

  eq(other: RenderedWidget) {
    return (
      other.markdown === this.markdown &&
      other.block === this.block &&
      other.side === this.side
    );
  }

  toDOM() {
    const el = document.createElement(this.block ? "div" : "span");
    el.className = this.block ? "cm-md-block" : "cm-md-inline";
    const cleanup = this.render(this.markdown, el, this.side);
    (el as HTMLElement & { cmCleanup?: () => void }).cmCleanup = cleanup;
    return el;
  }

  destroy(dom: HTMLElement) {
    (dom as HTMLElement & { cmCleanup?: () => void }).cmCleanup?.();
  }

  // Clicking a rendered block moves the cursor into it to edit the source.
  ignoreEvent() {
    return false;
  }
}

class CheckboxWidget extends WidgetType {
  constructor(readonly checked: boolean) {
    super();
  }

  eq(other: CheckboxWidget) {
    return other.checked === this.checked;
  }

  toDOM() {
    // Same markup remark-gfm renders: a disabled checkbox, then a space.
    const wrap = document.createElement("span");
    const input = document.createElement("input");
    input.type = "checkbox";
    input.disabled = true;
    input.checked = this.checked;
    wrap.append(input, " ");
    return wrap;
  }
}

type Builder = {
  state: EditorState;
  /** Unfocused editors render everything, like the published page. */
  focused: boolean;
  doc: Text;
  decos: Range<Decoration>[];
  lineClasses: Map<number, Set<string>>;
  // Gap owed below each line (applied to the line or the blank line after).
  lineGaps: Map<number, string>;
  render: RenderMarkdown;
  /** Images seen so far, in document order (for alternating sides). */
  imageIndex: number;
};

function addLineClass(b: Builder, lineNo: number, className: string) {
  let set = b.lineClasses.get(lineNo);
  if (!set) b.lineClasses.set(lineNo, (set = new Set()));
  for (const c of className.split(" ")) if (c) set.add(c);
}

function forEachLine(
  b: Builder,
  from: number,
  to: number,
  fn: (lineNo: number) => void,
) {
  const first = b.doc.lineAt(from).number;
  const last = b.doc.lineAt(to).number;
  for (let n = first; n <= last; n++) fn(n);
}

function touches(b: Builder, from: number, to: number) {
  if (!b.focused) return false;
  return b.state.selection.ranges.some((r) => r.from <= to && r.to >= from);
}

function lineIsActive(b: Builder, pos: number) {
  const line = b.doc.lineAt(pos);
  return touches(b, line.from, line.to);
}

function hide(b: Builder, from: number, to: number) {
  if (to > from) b.decos.push(Decoration.replace({}).range(from, to));
}

function markRaw(b: Builder, from: number, to: number) {
  if (to > from) {
    b.decos.push(Decoration.mark({ class: cls.mark }).range(from, to));
  }
}

/** Hide syntax unless the cursor is in `scope`; otherwise dim it. */
function syntax(
  b: Builder,
  from: number,
  to: number,
  active: boolean,
  withSpace = false,
) {
  let end = to;
  if (withSpace && b.doc.sliceString(end, end + 1) === " ") end++;
  if (active) markRaw(b, from, to);
  else hide(b, from, end);
}

function inline(b: Builder, node: SyntaxNode) {
  for (let child = node.firstChild; child; child = child.nextSibling) {
    const active = touches(b, child.from, child.to);

    switch (child.name) {
      case "StrongEmphasis":
      case "Emphasis":
      case "Strikethrough": {
        const className =
          child.name === "StrongEmphasis"
            ? cls.strong
            : child.name === "Emphasis"
              ? cls.em
              : cls.del;
        b.decos.push(
          Decoration.mark({ class: className }).range(child.from, child.to),
        );
        for (let m = child.firstChild; m; m = m.nextSibling) {
          if (m.name === "EmphasisMark" || m.name === "StrikethroughMark") {
            syntax(b, m.from, m.to, active);
          }
        }
        inline(b, child);
        break;
      }
      case "InlineCode": {
        b.decos.push(
          Decoration.mark({ class: cls.code }).range(child.from, child.to),
        );
        for (let m = child.firstChild; m; m = m.nextSibling) {
          if (m.name === "CodeMark") syntax(b, m.from, m.to, active);
        }
        break;
      }
      case "Link": {
        // [label](url "title"): style the label, hide the rest.
        const marks: SyntaxNode[] = [];
        for (let m = child.firstChild; m; m = m.nextSibling) {
          if (m.name === "LinkMark") marks.push(m);
        }
        const open = marks[0];
        const close = marks[1];
        if (open && close) {
          b.decos.push(
            Decoration.mark({ class: cls.link }).range(open.to, close.from),
          );
          syntax(b, open.from, open.to, active);
          syntax(b, close.from, child.to, active);
          inline(b, child);
        }
        break;
      }
      case "URL":
      case "Autolink": {
        // Bare and <angle> links render as links when published.
        if (child.name === "Autolink") {
          const first = child.firstChild;
          const last = child.lastChild;
          if (first?.name === "LinkMark" && last?.name === "LinkMark") {
            syntax(b, first.from, first.to, active);
            syntax(b, last.from, last.to, active);
          }
        }
        b.decos.push(
          Decoration.mark({ class: cls.link }).range(child.from, child.to),
        );
        break;
      }
      case "Image": {
        // Counted even while shown raw, so sides don't flip as you edit.
        const index = b.imageIndex++;
        const side = imageSide(index);
        // Like the published paragraph: start below the previous image.
        const clear = imageClearClass(index);
        if (clear) addLineClass(b, b.doc.lineAt(child.from).number, clear);
        if (active) {
          markRaw(b, child.from, child.to);
        } else {
          // Images are display:block when published, so surrounding
          // spaces collapse; take the following one with the widget.
          let end = child.to;
          if (b.doc.sliceString(end, end + 1) === " ") end++;
          b.decos.push(
            Decoration.replace({
              widget: new RenderedWidget(
                b.doc.sliceString(child.from, child.to),
                b.render,
                false,
                side,
              ),
            }).range(child.from, end),
          );
        }
        break;
      }
      case "Escape": {
        syntax(b, child.from, child.from + 1, active);
        break;
      }
      default:
        if (child.firstChild) inline(b, child);
    }
  }
}

function blockGap(b: Builder, node: SyntaxNode, gap: string) {
  b.lineGaps.set(b.doc.lineAt(node.to).number, gap);
}

function block(b: Builder, node: SyntaxNode, inList = false) {
  const name = node.name;

  if (name === "Paragraph") {
    forEachLine(b, node.from, node.to, (n) => {
      addLineClass(b, n, inList ? `${cls.li} ${cls.p}` : cls.p);
    });
    blockGap(b, node, gapClass.p);
    inline(b, node);
    return;
  }

  const heading = /^(?:ATX|Setext)Heading(\d)$/.exec(name);
  if (heading) {
    const level = Number(heading[1]);
    const lineNo = b.doc.lineAt(node.from).number;
    const active = lineIsActive(b, node.from);
    forEachLine(b, node.from, node.to, (n) => {
      const c = cls.h[level];
      if (c) addLineClass(b, n, c);
    });
    if (level <= 3) {
      blockGap(b, node, gapClass[`h${level}` as "h1" | "h2" | "h3"]);
    }
    for (let m = node.firstChild; m; m = m.nextSibling) {
      if (m.name !== "HeaderMark") continue;
      const markLine = b.doc.lineAt(m.from).number;
      if (name.startsWith("Setext") && markLine !== lineNo) {
        // The ==== / ---- underline: collapse the whole line.
        if (!active && !lineIsActive(b, m.from)) {
          addLineClass(b, markLine, cls.collapsed);
          hide(b, m.from, m.to);
        } else markRaw(b, m.from, m.to);
      } else {
        syntax(b, m.from, m.to, active, true);
      }
    }
    inline(b, node);
    return;
  }

  if (name === "BulletList" || name === "OrderedList") {
    // Like remark: a list is loose (items wrapped in <p>) when a blank line
    // separates its items or their children.
    const loose = /\n[ \t]*\n/.test(
      b.doc.sliceString(node.from, node.to).replace(/\s+$/, ""),
    );
    for (let item = node.firstChild; item; item = item.nextSibling) {
      if (item.name !== "ListItem") continue;
      const active = lineIsActive(b, item.from);
      let hasParagraph = false;
      for (let c = item.firstChild; c; c = c.nextSibling) {
        if (c.name === "ListMark") {
          syntax(b, c.from, c.to, active, true);
        } else if (c.name === "Task") {
          for (let t = c.firstChild; t; t = t.nextSibling) {
            if (t.name !== "TaskMarker") continue;
            if (active) markRaw(b, t.from, t.to);
            else {
              const checked = /x/i.test(b.doc.sliceString(t.from, t.to));
              let end = t.to;
              if (b.doc.sliceString(end, end + 1) === " ") end++;
              b.decos.push(
                Decoration.replace({
                  widget: new CheckboxWidget(checked),
                }).range(t.from, end),
              );
            }
          }
          forEachLine(b, c.from, c.to, (n) => addLineClass(b, n, cls.li));
          inline(b, c);
        } else if (c.name === "Paragraph" && loose) {
          hasParagraph = true;
          block(b, c, true);
        } else if (c.name === "Paragraph") {
          // Tight item: plain <li> text, no paragraph styles or gap.
          inline(b, c);
        } else {
          block(b, c, true);
        }
      }
      // Tight list items have no <p>; they take the plain <li> style.
      if (!hasParagraph) {
        forEachLine(b, item.from, item.to, (n) => addLineClass(b, n, cls.li));
      }
      blockGap(b, item, gapClass.li);
    }
    return;
  }

  if (name === "Blockquote") {
    for (let c = node.firstChild; c; c = c.nextSibling) {
      if (c.name === "QuoteMark") {
        syntax(b, c.from, c.to, lineIsActive(b, c.from), true);
      } else block(b, c, inList);
    }
    return;
  }

  if (name === "FencedCode" || name === "CodeBlock") {
    const active = touches(b, node.from, node.to);
    forEachLine(b, node.from, node.to, (n) => addLineClass(b, n, cls.code));
    if (name === "FencedCode") {
      // Opening and closing fence lines disappear when not editing.
      const firstLine = b.doc.lineAt(node.from);
      const lastLine = b.doc.lineAt(node.to);
      for (const line of [firstLine, lastLine]) {
        if (!/^\s*(```|~~~)/.test(line.text)) continue;
        if (active) markRaw(b, line.from, line.to);
        else {
          addLineClass(b, line.number, cls.collapsed);
          hide(b, line.from, line.to);
        }
      }
    }
    return;
  }

  if (name === "HorizontalRule") {
    const active = lineIsActive(b, node.from);
    if (active) markRaw(b, node.from, node.to);
    else {
      addLineClass(b, b.doc.lineAt(node.from).number, cls.hr);
      hide(b, node.from, node.to);
    }
    return;
  }

  if (name === "Table") {
    const active = touches(b, node.from, node.to);
    // Keep the count in step with the published page, which numbers
    // images inside tables too.
    node.toTree().iterate({
      enter: (n) => {
        if (n.name === "Image") b.imageIndex++;
      },
    });
    if (!active) {
      b.decos.push(
        Decoration.replace({
          widget: new RenderedWidget(
            b.doc.sliceString(node.from, node.to),
            b.render,
            true,
          ),
          block: true,
        }).range(node.from, node.to),
      );
    }
    return;
  }

  // Anything else (HTML, link references, …): style its inline content.
  inline(b, node);
}

function build(
  state: EditorState,
  focused: boolean,
  render: RenderMarkdown,
): DecorationSet {
  const tree =
    ensureSyntaxTree(state, state.doc.length, 200) ?? syntaxTree(state);
  const b: Builder = {
    state,
    focused,
    doc: state.doc,
    decos: [],
    lineClasses: new Map(),
    lineGaps: new Map(),
    render,
    imageIndex: 0,
  };

  for (let node = tree.topNode.firstChild; node; node = node.nextSibling) {
    block(b, node);
  }

  // Place each block's gap: on the blank line after it if there is one,
  // otherwise as padding on its own last line. Further blank lines collapse,
  // like consecutive margins do in the published page.
  let pendingGap: string | undefined;
  for (let n = 1; n <= b.doc.lines; n++) {
    const line = b.doc.line(n);
    const isBlank = line.text.trim() === "" && !b.lineClasses.has(n);

    if (isBlank) {
      const active = touches(b, line.from, line.to);
      if (pendingGap) {
        addLineClass(b, n, blankClass[pendingGap] ?? "cm-md-blank h-3");
        pendingGap = undefined;
      } else if (!active) {
        addLineClass(b, n, cls.collapsed);
      } else {
        addLineClass(b, n, "cm-md-blank h-5");
      }
      continue;
    }

    if (pendingGap) {
      // No blank line after the previous block: pad that block instead.
      addLineClass(b, n - 1, pendingGap);
      pendingGap = undefined;
    }
    pendingGap = b.lineGaps.get(n);
  }
  if (pendingGap) addLineClass(b, b.doc.lines, pendingGap);

  for (const [lineNo, classes] of b.lineClasses) {
    b.decos.push(
      Decoration.line({ class: [...classes].join(" ") }).range(
        b.doc.line(lineNo).from,
      ),
    );
  }

  return Decoration.set(b.decos, true);
}

const setFocused = StateEffect.define<boolean>();

const focusedField = StateField.define<boolean>({
  create: () => false,
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(setFocused)) return effect.value;
    }
    return value;
  },
});

export function livePreview(render: RenderMarkdown) {
  const field = StateField.define<DecorationSet>({
    create: (state) => build(state, state.field(focusedField), render),
    update(value, tr) {
      const focused = tr.state.field(focusedField);
      if (
        tr.docChanged ||
        tr.selection ||
        focused !== tr.startState.field(focusedField) ||
        syntaxTree(tr.state) !== syntaxTree(tr.startState)
      ) {
        return build(tr.state, focused, render);
      }
      return value;
    },
    provide: (f) => EditorView.decorations.from(f),
  });

  return [
    focusedField,
    EditorView.focusChangeEffect.of((_state, focusing) =>
      setFocused.of(focusing),
    ),
    field,
  ];
}
