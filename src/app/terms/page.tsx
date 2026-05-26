import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service | OSINF",
  description:
    "Read the OSINF terms of service covering acceptable use, content attribution, and limitations of the service.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <main className="min-h-[calc(100vh-180px)] bg-[var(--bg)] px-4 py-10">
      <div className="mx-auto max-w-4xl rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
          Terms of Service
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-[var(--text)]">Terms for using OSINF</h1>

        <div className="mt-6 space-y-8 text-sm leading-7 text-[var(--muted)]">
          <section>
            <h2 className="text-lg font-semibold text-[var(--text)]">Use of the service</h2>
            <p className="mt-3">
              OSINF is provided as an informational interface for monitoring open-source
              reporting. You agree to use the site lawfully and not to misuse, disrupt, or
              attempt to interfere with the service or underlying infrastructure.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text)]">Third-party content</h2>
            <p className="mt-3">
              Articles, excerpts, images, and source links may originate from third-party
              publishers. Those publishers retain their rights and remain the source of record.
              If a publisher requests removal or correction of rendering behavior, we may
              update or disable in-app rendering for that source.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text)]">No warranty</h2>
            <p className="mt-3">
              OSINF is provided on an as-is basis. We do not guarantee uninterrupted
              availability, perfect accuracy, or completeness of third-party reporting and
              summaries.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text)]">Changes</h2>
            <p className="mt-3">
              We may update the service, these terms, and site policies over time. Continued
              use of the site after those changes means you accept the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-[var(--text)]">Contact</h2>
            <p className="mt-3">
              For legal or service questions, contact{" "}
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
