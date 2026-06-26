type NavBarProps = {
  className?: string;
};
export default function NavBar({ className }: NavBarProps) {
  return (
    <nav className={`${className ?? ""}`}>
      <p>bloggin NavBar</p>
      <p>sign in</p>
    </nav>
  );
}
