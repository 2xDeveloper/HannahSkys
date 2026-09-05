import { AppShell } from "@/components/AppShell";
import Link from "next/link";

export default function GalleryNotFound() {
  return (
    <AppShell>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
        <h1 className="app-heading font-display text-2xl font-extrabold">Item not found</h1>
        <p className="app-muted text-sm">This piece isn&apos;t in the collection.</p>
        <Link href="/gallery" className="landing-btn-primary">
          Back to the collection
        </Link>
      </div>
    </AppShell>
  );
}
