import { AppShell } from "@/components/AppShell";
import Link from "next/link";

export default function CreatorNotFound() {
  return (
    <AppShell>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="app-heading font-display text-2xl font-extrabold">Not found</h1>
        <p className="app-muted max-w-sm text-sm">
          This creator doesn&apos;t exist or hasn&apos;t been approved yet.
        </p>
        <Link href="/gallery" className="landing-btn-primary">
          Back to the collection
        </Link>
      </div>
    </AppShell>
  );
}
