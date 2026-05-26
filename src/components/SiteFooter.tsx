import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--line)] bg-[var(--bg)]">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-[var(--muted)] md:flex-row md:items-center md:justify-between">
        <div>
          <p className="font-semibold text-[var(--text)]">OSINF</p>
          <p className="mt-1 max-w-2xl">
            Open source intelligence monitoring with in-app reading across geopolitical,
            cyber, maritime, aviation, environmental, and dark web coverage.
          </p>
        </div>

        <nav className="flex flex-wrap gap-4">
          <Link className="transition hover:text-[var(--text)]" href="/">
            Dashboard
          </Link>
          <Link className="transition hover:text-[var(--text)]" href="/about">
            About Us
          </Link>
          <Link className="transition hover:text-[var(--text)]" href="/contact">
            Contact Us
          </Link>
        </nav>
      </div>
    </footer>
  );
}
