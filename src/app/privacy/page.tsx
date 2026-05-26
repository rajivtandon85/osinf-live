import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | OSINF",
  description:
    "Read the OSINF privacy policy covering analytics, advertising, contact information, and how publicly sourced content is handled.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <main className="min-h-[calc(100vh-180px)] bg-[var(--bg)] px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Privacy Policy
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--text)]">How OSINF handles data</h1>

        <div className="mt-6 space-y-8 text-sm leading-7 text-[var(--muted)]">
          <section>
            <h2 className="text-lg font-semibold text-[var(--text)]">Overview</h2>
            <p className="mt-3">
              OSINF is operated by MidyaMobi Pvt Ltd. This site aggregates and organizes
              publicly available reporting and may use analytics, advertising, and operational
              logs to keep the service working, understand usage, and improve the product.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text)]">Information we may collect</h2>
            <p className="mt-3">
              We may collect technical information such as browser type, device type, pages
              viewed, timestamps, referrer information, and interaction events. If you contact
              us directly, we may also receive the information you provide in that message.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text)]">Advertising and analytics</h2>
            <p className="mt-3">
              OSINF may display advertising, including Google AdSense, and may use analytics
              tools to understand traffic and engagement. These services may use cookies or
              similar technologies subject to their own policies and applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text)]">Content sourcing</h2>
            <p className="mt-3">
              OSINF indexes and presents summaries or extracted renderings of publicly
              available material from third-party publishers. Original publishers remain the
              source of record for their content, rights, and editorial decisions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text)]">Contact</h2>
            <p className="mt-3">
              For privacy-related questions, contact us at{" "}
              <a className="text-[var(--link)] underline underline-offset-4" href="mailto:info@midyamobi.com">
                info@midyamobi.com
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
