"use client";

import { useState } from "react";

type Theme = "light" | "dark";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  localStorage.setItem("osinf-theme", theme);
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "dark";
    const root = document.documentElement;
    if (root.classList.contains("light")) return "light";
    if (root.classList.contains("dark")) return "dark";
    const saved = localStorage.getItem("osinf-theme");
    if (saved === "light" || saved === "dark") return saved;
    return window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  const toggle = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    applyTheme(next);
  };

  return (
    <button
      onClick={toggle}
      suppressHydrationWarning
      className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-2.5 py-1.5 text-xs text-[var(--muted)] transition hover:text-[var(--text)]"
      title="Toggle theme"
    >
      {theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
