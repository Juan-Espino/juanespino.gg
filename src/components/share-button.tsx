import { env } from "~/env";

type ShareButtonProps = {
  slug: string;
};
export default function ShareButton({ slug }: ShareButtonProps) {
  return (
    // TODO:shadcn this and add toast when clicked
    <button
      className=""
      onClick={async () => {
        await navigator.clipboard.writeText(
          `${env.NEXT_PUBLIC_BLOGGIN_URL}article/${slug}`,
        );
      }}
    >
      {"share"}
    </button>
  );
}
