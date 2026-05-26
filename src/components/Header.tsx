"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

interface HeaderProps {
  lastRefreshed: string | null;
  onRefresh: () => void;
  isRefreshing: boolean;
  alertCount: number;
  onAlertsClick: () => void;
}

export function Header({
  lastRefreshed,
  onRefresh,
  isRefreshing,
  alertCount,
  onAlertsClick,
}: HeaderProps) {
  const timeAgo = lastRefreshed
    ? formatDistanceToNow(new Date(lastRefreshed), { addSuffix: true })
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--bg)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 ring-1 ring-blue-500/30">
            <span className="text-sm">⬡</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-widest text-[var(--text)]/90 uppercase">
              OSINF
            </h1>
            <p className="text-[10px] text-[var(--muted)] leading-none tracking-wider">
              Open Source Intelligence Feed
            </p>
          </div>
        </div>

        {/* Status + Controls */}
        <div className="flex items-center gap-3">
          <nav className="hidden items-center gap-3 text-xs text-[var(--muted)] md:flex">
            <Link className="transition hover:text-[var(--text)]" href="/about">
              About Us
            </Link>
            <Link className="transition hover:text-[var(--text)]" href="/contact">
              Contact Us
            </Link>
          </nav>

          {/* Last refreshed */}
          {timeAgo && (
            <span className="hidden text-[11px] text-[var(--muted)] sm:block">
              Updated {timeAgo}
            </span>
          )}

          {/* Alerts button */}
          <button
            onClick={onAlertsClick}
            className="relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-[var(--text)]/60 transition hover:bg-white/5 hover:text-[var(--text)]/90"
          >
            <span>⚑</span>
            <span>Alerts</span>
            {alertCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {alertCount > 99 ? "99+" : alertCount}
              </span>
            )}
          </button>

          {/* Refresh button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium text-[var(--text)]/60 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-[var(--text)]/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className={isRefreshing ? "animate-spin" : ""}>↻</span>
            <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
