import { Great_Vibes } from "next/font/google";
import Link from "next/link";

const script = Great_Vibes({ weight: "400", subsets: ["latin"] });

type LogoProps = {
  size?: "sm" | "lg";
  className?: string;
  /** Wrap logo in a link to the home page */
  linkToHome?: boolean;
};

export function Logo({ size = "lg", className = "", linkToHome = false }: LogoProps) {
  const sizeClass =
    size === "sm" ? "text-lg leading-tight" : "text-xl leading-tight md:text-3xl";

  const label = (
    <span
      className={`${script.className} text-bp-gold drop-shadow-[0_0_14px_rgba(196,30,58,0.45)] ${sizeClass}`}
    >
      FindomVids.xyz
    </span>
  );

  if (linkToHome) {
    return (
      <Link
        href="/"
        className={`inline-block transition-opacity hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-bp-gold/60 ${className}`}
        aria-label="FindomVids.xyz home"
      >
        {label}
      </Link>
    );
  }

  return <span className={className}>{label}</span>;
}
