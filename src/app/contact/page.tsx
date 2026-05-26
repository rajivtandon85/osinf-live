import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | OSINF",
  description:
    "Contact OSINF using the published MidyaMobi business details for support, partnerships, advertising, or general inquiries.",
};

const whatsappHref = "https://wa.me/639778550482";
const emailHref = "mailto:info@midyamobi.com";

export default function ContactPage() {
  return (
    <main className="min-h-[calc(100vh-180px)] bg-[var(--bg)] px-4 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-3xl border border-[var(--line)] bg-[var(--panel)] p-8 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--muted)]">
            Contact Us
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-[var(--text)]">Reach the OSINF team</h1>
          <p className="mt-4 text-base leading-8 text-[var(--muted)]">
            For support, partnerships, media inquiries, or advertising conversations, use the
            operator contact details below. These details follow the business contact
            information published on MidyaMobi.
          </p>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <section className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Office
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--text)]">
                MidyaMobi Pvt Ltd
                <br />
                Makati Central Business District
                <br />
                Metro Manila, Philippines
              </p>
            </section>

            <section className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                Email
              </h2>
              <a
                href={emailHref}
                className="mt-4 block text-sm font-medium text-[var(--link)] underline underline-offset-4"
              >
                info@midyamobi.com
              </a>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Best for support, partnerships, corrections, and general business inquiries.
              </p>
            </section>

            <section className="rounded-2xl border border-[var(--line)] bg-[var(--bg)] p-6">
              <h2 className="text-sm font-semibold uppercase tracking-[0.2em] text-[var(--muted)]">
                WhatsApp
              </h2>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 block text-sm font-medium text-[var(--link)] underline underline-offset-4"
              >
                +63 977 855 0482
              </a>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                Best for quick outreach and early-stage commercial conversations.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
