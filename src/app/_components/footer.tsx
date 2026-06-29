type FooterProps = {
  className?: string;
};
export default function Footer({ className }: FooterProps) {
  return (
    <footer
      className={`${className ?? ""} border-bloggin-border/40 mt-4 flex min-h-14 items-center justify-center border-t px-4 py-3 sm:px-0`}
    >
      <p className="text-bloggin-muted text-center text-sm font-semibold">
        a Juan Espino production
      </p>
    </footer>
  );
}
