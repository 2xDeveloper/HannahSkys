import { AppShell } from "@/components/AppShell";
import Link from "next/link";

export default function CreatorNotFound() {
  return (
    <AppShell>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 bg-bp-main p-8 text-center">
        <h1 className="text-xl font-bold text-rose-50">Creator not found</h1>
        <p className="max-w-sm text-sm text-gray-500">
          This creator doesn&apos;t exist or hasn&apos;t been approved yet.
        </p>
        <Link
          href="/"
          className="rounded-xl bg-bp-gold px-5 py-2.5 text-sm font-semibold text-white hover:bg-bp-gold-dim"
        >
          Back to gallery
        </Link>
      </div>
    </AppShell>
  );
}
