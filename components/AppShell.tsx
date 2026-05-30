import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  children: React.ReactNode;
  /** Hide filter area; use for detail pages */
  mainClassName?: string;
};

export function AppShell({ children, mainClassName }: AppShellProps) {
  return (
    <div className="flex h-screen flex-col overflow-hidden bg-bp-black">
      <Header />
      <div className="flex min-h-0 flex-1">
        <Sidebar />
        <main
          className={`flex min-w-0 flex-1 flex-col overflow-hidden bg-bp-main ${mainClassName ?? ""}`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
