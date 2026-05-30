import { ShellLayout } from "./ShellLayout";
import { Sidebar } from "./Sidebar";

type AppShellProps = {
  children: React.ReactNode;
  /** Hide filter area; use for detail pages */
  mainClassName?: string;
};

export function AppShell({ children, mainClassName }: AppShellProps) {
  return (
    <ShellLayout mainClassName={mainClassName} sidebar={<Sidebar />}>
      {children}
    </ShellLayout>
  );
}
