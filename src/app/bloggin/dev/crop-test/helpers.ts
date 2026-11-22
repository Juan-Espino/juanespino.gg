import { markdownStyles } from "~/lib/markdown-styles";

export { loadImage } from "~/lib/crop-image";
// Same box as the editor's header-image slot.
export const markdownStylesHeader = markdownStyles.headerImage.replace(
  "float-right",
  "",
);
