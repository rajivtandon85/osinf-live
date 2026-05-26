import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Us | OSINF",
  description:
    "Learn about OSINF, our mission, and how we organize open source intelligence coverage for faster situational awareness.",
};

export default function AboutPage() {
  return (
    <main className="min-h-[calc(100vh-180px)] bg-[var(--bg)] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            About Us
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--text)]">What OSINF is built for</h1>
          <p className="mt-4 text-base leading-8 text-[var(--muted)]">
            OSINF is a news and intelligence monitoring interface designed to help analysts,
            researchers, operators, and decision-makers scan important open-source reporting
            faster. We organize coverage across geopolitical, cyber, maritime, aviation,
            environmental, and dark web themes, while keeping article reading inside the app
            whenever possible.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <section className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text)]">What we do</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
                <li>Aggregate feeds from news, OSINT, and OSINF sources.</li>
                <li>Organize reporting by category for fast triage.</li>
                <li>Prioritize in-app reading so users stay in one workflow.</li>
                <li>Support search, alerts, saved views, and local-country weighting.</li>
              </ul>
            </section>

            <section className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-6">
              <h2 className="text-lg font-semibold text-[var(--text)]">Transparency</h2>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--muted)]">
                <li>We surface and summarize publicly available reporting.</li>
                <li>Original publishers remain the source of record for their content.</li>
                <li>When a source blocks in-app rendering, we provide a clear fallback path.</li>
                <li>Contact details for the service operator are listed on our Contact Us page.</li>
              </ul>
            </section>
          </div>

          <section className="mt-8 rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-6">
            <h2 className="text-lg font-semibold text-[var(--text)]">Operator information</h2>
            <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
              OSINF is operated using the business contact details published by MidyaMobi.
              For commercial inquiries, support, corrections, or partnership requests, please
              use the official contact details on the Contact Us page.
            </p>
            <Link
              href="/contact"
              className="mt-5 inline-flex rounded-xl border border-[var(--line)] bg-[var(--panel)] px-4 py-2 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--panel-2)]"
            >
              Go to Contact Us
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
