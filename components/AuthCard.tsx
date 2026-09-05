import { Logo } from "./Logo";

type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#fff5f9] to-white px-4 py-12">
      <div className="page-enter mb-8 text-center">
        <Logo tone="light" linkToHome />
        <p className="app-muted mt-3 text-xs font-medium">Photos · Films · Messages</p>
      </div>
      <div className="page-enter app-card w-full max-w-md rounded-3xl p-8">
        <h1 className="app-heading font-display text-2xl font-extrabold">{title}</h1>
        <p className="app-muted mt-1 text-sm">{subtitle}</p>
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
