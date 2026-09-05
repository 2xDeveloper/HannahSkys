import { HannahSkysLanding } from "@/components/landing/HannahSkysLanding";
import { getLandingContent } from "@/lib/landing-content";

export default async function HomePage() {
  const content = await getLandingContent();

  return <HannahSkysLanding content={content} />;
}
