type SubmitButtonProps = {
  mode: "create" | "edit";
};
export default function SubmitButton({ mode }: SubmitButtonProps) {
  return (
    // TODO:shadcn
    <button type="submit">{mode === "create" ? "create" : "save"}</button>
  );
}
