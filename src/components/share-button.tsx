import { env } from "~/env";

type ShareButtonProps = {
  slug: string;
};
export default function ShareButton({ slug }: ShareButtonProps) {
  return (
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
