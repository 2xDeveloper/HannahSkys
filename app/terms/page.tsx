import { AppShell } from "@/components/AppShell";
import Link from "next/link";

export const metadata = {
  title: "Terms of Service — FindomVids.xyz",
  description: "Terms of Service and acceptable use for FindomVids.xyz",
};

export default function TermsPage() {
  return (
    <AppShell mainClassName="!overflow-y-auto">
      <div className="mx-auto max-w-3xl px-4 py-8 md:px-8 md:py-12">
        <Link
          href="/"
          className="text-sm text-bp-yellow hover:text-white"
        >
          ← Back to gallery
        </Link>

        <header className="mt-6 border-b border-bp-border pb-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-bp-yellow">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-bold text-rose-50">Terms of Service</h1>
          <p className="mt-2 text-sm text-gray-500">
            Last updated: May 30, 2026 · FindomVids.xyz
          </p>
        </header>

        <article className="prose prose-invert mt-8 max-w-none space-y-8 text-sm leading-relaxed text-gray-300 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-rose-50 [&_h3]:text-base [&_h3]:font-medium [&_h3]:text-rose-100 [&_li]:text-gray-300 [&_p]:text-gray-300 [&_strong]:text-gray-200">
          <section>
            <h2>1. Acceptance of terms</h2>
            <p>
              By accessing or using FindomVids.xyz (&quot;the Platform,&quot; &quot;we,&quot;
              &quot;us,&quot; or &quot;our&quot;), you agree to be bound by these Terms of Service
              (&quot;Terms&quot;). If you do not agree, you must not use the Platform.
            </p>
          </section>

          <section>
            <h2>2. Age requirement (18+)</h2>
            <p>
              <strong>
                The Platform contains adult-oriented material and is intended exclusively for
                individuals who are at least eighteen (18) years of age
              </strong>{" "}
              or the age of legal majority in your jurisdiction, whichever is greater.
            </p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>You represent and warrant that you meet this age requirement.</li>
              <li>
                You confirm that viewing adult content is legal in your location and that you are
                not accessing the Platform from a jurisdiction where such content is prohibited.
              </li>
              <li>
                We do not knowingly permit registration, access, or purchases by anyone under 18.
                Misrepresenting your age is a material breach of these Terms.
              </li>
            </ul>
          </section>

          <section>
            <h2>3. Description of service</h2>
            <p>
              FindomVids.xyz is a creator marketplace where approved creators may upload and sell
              digital content (photos, videos, and related media) to registered users. We provide
              hosting, discovery, messaging, and payment processing tools. We are a platform — not
              the publisher of creator-uploaded content.
            </p>
          </section>

          <section>
            <h2>4. Account registration</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>You must provide accurate, current information when creating an account.</li>
              <li>You are responsible for safeguarding your login credentials and all activity under your account.</li>
              <li>One person may not maintain multiple accounts to evade enforcement actions.</li>
              <li>
                Creator accounts require identity verification and admin approval before content may
                be published or monetized.
              </li>
            </ul>
          </section>

          <section>
            <h2>5. Creator content &amp; ownership</h2>
            <p>
              Creators retain ownership of content they upload. By uploading content, creators grant
              the Platform a non-exclusive, worldwide license to host, display, promote, and
              distribute that content as necessary to operate the service (including previews,
              thumbnails, and delivery to purchasers).
            </p>
            <p className="mt-3">
              Creators represent that they own or have all necessary rights to the content they
              upload, that all individuals depicted are 18+ at the time of creation, and that they
              have obtained any required model releases or consents.
            </p>
          </section>

          <section>
            <h2>6. Purchases &amp; payments</h2>
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Paid content is licensed for personal, non-commercial use by the purchasing account
                unless otherwise stated.
              </li>
              <li>
                Payments are processed by third-party providers (e.g., Stripe). By purchasing, you
                agree to their terms as well.
              </li>
              <li>
                All sales are generally final. Digital goods, once delivered, may not be eligible for
                refund except where required by law or at our sole discretion in cases of technical
                failure to deliver purchased content.
              </li>
              <li>
                The Platform may charge a service fee on transactions. Fees are disclosed at
                checkout or in creator agreements.
              </li>
              <li>
                You may not resell, redistribute, publicly share, or leak purchased content.
              </li>
            </ul>
          </section>

          <section>
            <h2>7. Prohibited content &amp; conduct</h2>
            <p>You may not upload, purchase, distribute, or use the Platform to engage in:</p>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>Any content involving minors or persons who appear to be minors</li>
              <li>Non-consensual content, revenge porn, or content uploaded without subject consent</li>
              <li>Illegal activity, violence, bestiality, or content prohibited by applicable law</li>
              <li>Harassment, threats, doxing, or impersonation</li>
              <li>Malware, spam, scraping, or attempts to circumvent paywalls or security</li>
              <li>Money laundering, fraud, or unauthorized use of payment methods</li>
            </ul>
            <p className="mt-3">
              We reserve the right to remove content, suspend accounts, and report illegal activity
              to authorities without notice.
            </p>
          </section>

          <section>
            <h2>8. Messaging</h2>
            <p>
              Direct messaging between fans and creators must comply with these Terms. Unsolicited
              spam, harassment, or attempts to conduct off-platform transactions to evade fees are
              prohibited.
            </p>
          </section>

          <section>
            <h2>9. DMCA &amp; copyright</h2>
            <p>
              We respect intellectual property rights. If you believe content on the Platform
              infringes your copyright, contact us with a valid DMCA notice including identification
              of the work, the infringing material, and your contact information. Repeat infringers
              may have accounts terminated.
            </p>
          </section>

          <section>
            <h2>10. Privacy</h2>
            <p>
              We collect and use personal information as needed to operate the Platform (account
              data, payment processing, content delivery). We do not sell personal information to
              third parties for marketing. Payment data is handled by our payment processors and is
              not stored on our servers in full.
            </p>
          </section>

          <section>
            <h2>11. Disclaimers</h2>
            <p>
              THE PLATFORM IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT
              WARRANTIES OF ANY KIND. WE DO NOT GUARANTEE UNINTERRUPTED ACCESS, ERROR-FREE
              OPERATION, OR THAT CONTENT WILL MEET YOUR EXPECTATIONS. USE IS AT YOUR OWN RISK.
            </p>
          </section>

          <section>
            <h2>12. Limitation of liability</h2>
            <p>
              TO THE MAXIMUM EXTENT PERMITTED BY LAW, FINDOMVIDS.XYZ AND ITS OPERATORS SHALL NOT BE
              LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
              ANY LOSS OF PROFITS, DATA, OR GOODWILL ARISING FROM YOUR USE OF THE PLATFORM. OUR
              TOTAL LIABILITY FOR ANY CLAIM SHALL NOT EXCEED THE GREATER OF (A) AMOUNTS YOU PAID US
              IN THE TWELVE (12) MONTHS BEFORE THE CLAIM OR (B) ONE HUNDRED U.S. DOLLARS ($100).
            </p>
          </section>

          <section>
            <h2>13. Indemnification</h2>
            <p>
              You agree to indemnify and hold harmless the Platform and its operators from claims,
              damages, and expenses (including reasonable legal fees) arising from your content,
              your use of the service, or your violation of these Terms.
            </p>
          </section>

          <section>
            <h2>14. Termination</h2>
            <p>
              We may suspend or terminate your account at any time for violation of these Terms,
              legal requirements, or operational reasons. You may delete your account by contacting
              support. Provisions that by nature should survive termination (ownership, disclaimers,
              liability limits) will survive.
            </p>
          </section>

          <section>
            <h2>15. Changes to these terms</h2>
            <p>
              We may update these Terms from time to time. Material changes will be posted on this
              page with an updated date. Continued use after changes constitutes acceptance.
            </p>
          </section>

          <section>
            <h2>16. Governing law</h2>
            <p>
              These Terms are governed by the laws of the United States and the state in which the
              Platform operator is established, without regard to conflict-of-law principles. Disputes
              shall be resolved in the courts of that jurisdiction, except where prohibited by law.
            </p>
          </section>

          <section>
            <h2>17. Contact</h2>
            <p>
              For legal inquiries, DMCA notices, or account issues, contact us via our{" "}
              <a
                href="https://t.me/fandomvids"
                target="_blank"
                rel="noopener noreferrer"
                className="text-bp-yellow underline hover:text-white"
              >
                Telegram community
              </a>
              .
            </p>
          </section>
        </article>

        <footer className="mt-12 border-t border-bp-border pt-6 text-center text-xs text-gray-600">
          © {new Date().getFullYear()} FindomVids.xyz · Adults only (18+)
        </footer>
      </div>
    </AppShell>
  );
}
