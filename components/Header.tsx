import { Logo } from "./Logo";
import { HeaderAuth } from "./HeaderAuth";

export function Header() {
  return (
    <header className="relative flex h-14 shrink-0 items-center justify-center border-b border-bp-border bg-bp-black shadow-[0_1px_0_0_rgba(196,30,58,0.15)]">
      <Logo linkToHome />
      <HeaderAuth />
    </header>
  );
}
