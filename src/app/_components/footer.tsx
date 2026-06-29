type FooterProps = {
  className?: string;
};
export default function Footer({ className }: FooterProps) {
  return (
    <div
      className={`${className ?? ""} border-bloggin-border/40 mt-4 border-t pt-4`}
    >
      <p>Footer</p>
    </div>
  );
}
