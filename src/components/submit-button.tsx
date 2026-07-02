import { Button } from "./ui/button";

type SubmitButtonProps = {
  mode: "create" | "edit";
};
export default function SubmitButton({ mode }: SubmitButtonProps) {
  return <Button type="submit">{mode === "create" ? "create" : "save"}</Button>;
}
