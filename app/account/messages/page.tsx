import { redirect } from "next/navigation";

type PageProps = {
  searchParams: Promise<{ with?: string }>;
};

/** Legacy route — chat lives at /messages */
export default async function AccountMessagesRedirect({ searchParams }: PageProps) {
  const { with: threadPartner } = await searchParams;
  if (threadPartner) {
    redirect(`/messages?with=${encodeURIComponent(threadPartner)}`);
  }
  redirect("/messages");
}
