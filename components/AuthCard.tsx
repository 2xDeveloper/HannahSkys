import { Logo } from "./Logo";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bp-black px-4 py-12">
      <div className="mb-8">
        <Logo linkToHome />
      </div>
      <div className="w-full max-w-md rounded-2xl border border-bp-border bg-bp-main p-8 shadow-xl shadow-black/50">
        <h1 className="text-xl font-bold text-rose-50">{title}</h1>
        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
