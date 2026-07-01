type ReadMoreButtonProps = {
  expanded: boolean;
  onClick: () => void;
};
export default function ReadMoreButton({
  expanded,
  onClick,
}: ReadMoreButtonProps) {
  // TODO:shadcn lol
  return (
    <button
      type="button"
      onClick={onClick}
      className="border-bloggin-border/40 text-bloggin-muted hover:text-bloggin-foreground rounded-xl border px-4 py-2 font-bold transition-colors"
    >
      {expanded ? "read less" : "read more"}
    </button>
  );
}
