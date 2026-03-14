"use client";

import { FeedItem } from "@/types/feed";
import { CATEGORIES } from "@/lib/sources";
import { formatDistanceToNow } from "date-fns";

interface FeedCardProps {
  item: FeedItem;
  isAlert?: boolean;
  alertKeyword?: string;
  onRead: (item: FeedItem, fallbackWindow: Window | null) => void;
}

export function FeedCard({ item, isAlert, alertKeyword, onRead }: FeedCardProps) {
  const category = CATEGORIES[item.category];
  const timeAgo = formatDistanceToNow(new Date(item.publishedAt), {
    addSuffix: true,
  });

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => {
        const win = window.open("about:blank", "_blank");
        onRead(item, win);
      }}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          const win = window.open("about:blank", "_blank");
          onRead(item, win);
        }
      }}
      className={`
        group relative flex flex-col gap-2.5 rounded-xl border p-4 cursor-pointer
        transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg
        ${isAlert
          ? "border-red-500/30 bg-red-500/5 hover:border-red-500/50 hover:bg-red-500/10"
          : `${category.borderColor} bg-white/[0.02] hover:bg-white/[0.04]`
        }
      `}
    >
      {/* Alert badge */}
      {isAlert && alertKeyword && (
        <div className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-[10px] font-semibold text-red-400 ring-1 ring-red-500/30">
          <span>⚑</span>
          <span>{alertKeyword}</span>
        </div>
      )}

      {/* Top row: category + source + time + external link */}
      <div className="flex items-center gap-2">
        <span
          className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${category.bgColor} ${category.color} ring-1 ${category.borderColor}`}
        >
          <span>{category.icon}</span>
          <span>{category.label}</span>
        </span>
        <span className="text-[11px] text-white/30">·</span>
        <span className="text-[11px] font-medium text-white/40 truncate max-w-[120px]">
          {item.sourceName}
        </span>
        <span className="ml-auto flex items-center gap-2 shrink-0">
          <span className="text-[11px] text-white/25">{timeAgo}</span>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="rounded p-0.5 text-white/15 transition hover:text-white/50"
            title="Open in new tab"
          >
            <svg
              className="h-3 w-3"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-4.5-6H21m0 0v7.5m0-7.5l-9 9"
              />
            </svg>
          </a>
        </span>
      </div>

      {/* Thumbnail + title row */}
      <div className="flex gap-3">
        {item.imageUrl && (
          <div className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.imageUrl}
              alt=""
              className="h-16 w-16 rounded-lg object-cover opacity-70 group-hover:opacity-90 transition-opacity"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
        <div className="flex flex-col gap-1 min-w-0">
          <h3 className="text-sm font-medium leading-snug text-white/80 group-hover:text-white/95 line-clamp-2 transition-colors">
            {item.title}
          </h3>
          {item.summary && (
            <p className="text-xs leading-relaxed text-white/35 line-clamp-2">
              {item.summary}
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      {item.tags && item.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {item.tags.filter((t) => typeof t === "string").slice(0, 4).map((tag) => (
            <span
              key={tag}
              className="rounded px-1.5 py-0.5 text-[10px] text-white/25 bg-white/5"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
