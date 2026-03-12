"use client";

import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

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
  const [copied, setCopied] = useState(false);

  const timeAgo = lastRefreshed
    ? formatDistanceToNow(new Date(lastRefreshed), { addSuffix: true })
    : null;

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600/20 ring-1 ring-blue-500/30">
            <span className="text-sm">⬡</span>
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-widest text-white/90 uppercase">
              OSINF
            </h1>
            <p className="text-[10px] text-white/30 leading-none tracking-wider">
              Open Source Intelligence Feed
            </p>
          </div>
        </div>

        {/* Status + Controls */}
        <div className="flex items-center gap-3">
          {/* Last refreshed */}
          {timeAgo && (
            <span className="hidden text-[11px] text-white/30 sm:block">
              Updated {timeAgo}
            </span>
          )}

          {/* Alerts button */}
          <button
            onClick={onAlertsClick}
            className="relative flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium text-white/60 transition hover:bg-white/5 hover:text-white/90"
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
            className="flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium text-white/60 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white/90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className={isRefreshing ? "animate-spin" : ""}>↻</span>
            <span>{isRefreshing ? "Refreshing…" : "Refresh"}</span>
          </button>
        </div>
      </div>
    </header>
  );
}
