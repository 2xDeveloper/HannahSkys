import { getHeaderAuthState } from "@/lib/auth/header-user";
import { ShellLayout } from "./ShellLayout";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  children: React.ReactNode;
  /** Hide filter area; use for detail pages */
  mainClassName?: string;
};

export async function AppShell({ children, mainClassName }: AppShellProps) {
  const headerAuth = await getHeaderAuthState();

  return (
    <ShellLayout mainClassName={mainClassName} sidebar={<Sidebar />} headerAuth={headerAuth}>
      {children}
    </ShellLayout>
  );
}
