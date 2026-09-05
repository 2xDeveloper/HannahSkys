import { Logo } from "./Logo";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="page-enter mb-8 text-center">
        <Logo linkToHome />
        <p className="mt-3 text-xs font-medium text-bp-yellow/70">
          Photos · Films · Messages
        </p>
      </div>
      <div className="page-enter w-full max-w-md rounded-3xl border border-bp-gold/20 bg-bp-main/80 p-8 shadow-[0_30px_80px_rgba(255,90,154,0.12)] backdrop-blur-xl">
        <h1 className="font-display text-2xl font-extrabold text-white">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
