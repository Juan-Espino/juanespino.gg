type FooterProps = {
  className?: string;
};
export default function Footer({ className }: FooterProps) {
  return (
    <div className={`${className ?? ""}`}>
      <p>Footer</p>
    </div>
  );
}
