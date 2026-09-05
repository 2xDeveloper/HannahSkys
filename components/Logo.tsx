import Link from "next/link";

type LogoProps = {
  size?: "sm" | "lg";
  className?: string;
  /** Wrap logo in a link to the home page */
  linkToHome?: boolean;
  tone?: "dark" | "light";
};

export function Logo({
  size = "lg",
  className = "",
  linkToHome = false,
  tone = "light",
}: LogoProps) {
  const mark = size === "sm" ? "h-7 w-7 text-[11px]" : "h-8 w-8 text-xs md:h-9 md:w-9 md:text-sm";
  const word = size === "sm" ? "text-[15px]" : "text-lg md:text-xl";
  const wordColor = tone === "light" ? "text-[#3f3a44]" : "text-white";

  const label = (
    <span className="inline-flex items-center gap-2">
      <span
        className={`inline-flex ${mark} items-center justify-center rounded-2xl bg-gradient-to-br from-bp-gold to-pink-400 font-display font-extrabold text-white shadow-[0_6px_16px_rgba(255,90,154,0.35)]`}
        aria-hidden
      >
        H
      </span>
      <span className={`font-display ${word} font-extrabold tracking-tight ${wordColor}`}>
        Hannah<span className="text-bp-gold">Skys</span>
      </span>
    </span>
  );

  if (linkToHome) {
    return (
      <Link
        href="/"
        className={`inline-flex items-center transition-transform duration-200 hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-bp-gold/60 ${className}`}
        aria-label="HannahSkys home"
      >
        {label}
      </Link>
    );
  }

  return <span className={className}>{label}</span>;
}
