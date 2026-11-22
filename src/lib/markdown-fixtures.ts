/**
 * Sample Markdown for every element the article renderer supports. Used by
 * the dev comparison page and the Playwright tests, so both check the same
 * input.
 */

const LOCAL_IMAGE = "/projects/bloggin.png";
// Not local and not UploadThing, so it takes the plain <img> path.
// (react-markdown strips data: URLs, so this points at the dev server.)
const EXTERNAL_IMAGE = "http://localhost:3000/projects/stepovers.png";

export const markdownFixtures = {
  paragraph:
    "I saw a post about how a studio can not be trusted to make a sequel, so I have to get some things off my chest.\n\nSecond paragraph after a blank line.",
  h1: "# Heading one\n\nText under the heading.",
  h2: "## Heading two\n\nText under the heading.",
  h3: "### Heading three\n\nText under the heading.",
  h4: "#### Heading four\n\nText under the heading.",
  h5: "##### Heading five\n\nText under the heading.",
  h6: "###### Heading six\n\nText under the heading.",
  bold: "Some **bold words** in a sentence.",
  italic: "Some *italic words* in a sentence.",
  strikethrough: "Some ~~struck words~~ in a sentence.",
  inlineCode: "Run `pnpm dev` to start.",
  link: "Read [the docs](https://example.com) first.",
  autolink: "Visit https://example.com today.",
  bulletList: "- first item\n- second item\n- third item",
  orderedList: "1. first item\n2. second item\n3. third item",
  taskList: "- [ ] open task\n- [x] done task",
  blockquote: "> A quoted paragraph.",
  codeBlock: "```ts\nconst answer = 42;\nconsole.log(answer);\n```",
  horizontalRule: "Above the rule.\n\n---\n\nBelow the rule.",
  table: "| Name | Score |\n| --- | --- |\n| Ellie | 10 |\n| Abby | 9 |",
  imageLocal: `Before ![local image](${LOCAL_IMAGE}) after.`,
  imageExternal: `Before ![external image](${EXTERNAL_IMAGE}) after.`,
  imageWrap: `![local image](${LOCAL_IMAGE}) you know what, this paragraph sits next to an embedded image and keeps going long enough that it has to wrap beside the picture for several lines and then continue underneath it once the picture ends, just like the article text does around the header image at the top of the page.

The next paragraph follows.`,
  imageAlternate: [1, 2, 3]
    .map(
      (n) =>
        `![image ${n}](${LOCAL_IMAGE}) Block ${n} starts beside its image and keeps going for a good while so that it wraps for several lines next to the picture before the next block begins below it, which is enough text to fill the height.`,
    )
    .join("\n\n"),
  wrap: Array.from(
    { length: 6 },
    (_, i) =>
      `Paragraph ${i + 1}. The narrative choice shows how deeply they care about the story rather than money. Most big studios would never have done it, not because they think it is a better story but because they are greedy, and this sentence keeps going so it wraps.`,
  ).join("\n\n"),
} as const;

export type MarkdownFixtureName = keyof typeof markdownFixtures;

export const fixtureHeaderImage = LOCAL_IMAGE;
