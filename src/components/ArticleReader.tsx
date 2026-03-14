"use client";

import { FeedItem } from "@/types/feed";
import { CATEGORIES } from "@/lib/sources";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useRef, useState } from "react";

interface ArticleData {
  title: string;
  content: string;
  byline: string;
  siteName: string;
  excerpt: string;
  length: number;
}

interface ArticleReaderProps {
  item: FeedItem;
  fallbackWindow: Window | null;
  onClose: () => void;
}

export function ArticleReader({ item, fallbackWindow, onClose }: ArticleReaderProps) {
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const winRef = useRef(fallbackWindow);

  const category = CATEGORIES[item.category];
  const timeAgo = formatDistanceToNow(new Date(item.publishedAt), {
    addSuffix: true,
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    let cancelled = false;

    async function fetchArticle() {
      try {
        const res = await fetch(
          `/api/read?url=${encodeURIComponent(item.url)}`
        );
        const json = await res.json();

        if (cancelled) return;

        if (json.success && json.data?.content) {
          // Extraction succeeded — close the fallback tab and show reader
          try { winRef.current?.close(); } catch { /* cross-origin */ }
          setArticle(json.data);
          setLoading(false);
        } else {
          // Extraction failed — redirect the fallback tab to the article
          try {
            if (winRef.current && !winRef.current.closed) {
              winRef.current.location.href = item.url;
            }
          } catch { /* cross-origin */ }
          onClose();
        }
      } catch {
        if (!cancelled) {
          try {
            if (winRef.current && !winRef.current.closed) {
              winRef.current.location.href = item.url;
            }
          } catch { /* cross-origin */ }
          onClose();
        }
      }
    }

    fetchArticle();
    return () => {
      cancelled = true;
    };
  }, [item.url, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/80 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative mx-auto my-8 w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0d0d14] shadow-2xl">
        {/* Header bar */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 rounded-t-2xl border-b border-white/5 bg-[#0d0d14]/95 px-6 py-4 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            <span
              className={`shrink-0 flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${category.bgColor} ${category.color} ring-1 ${category.borderColor}`}
            >
              <span>{category.icon}</span>
              <span>{category.label}</span>
            </span>
            <span className="truncate text-xs text-white/40">
              {item.sourceName}
            </span>
            <span className="text-[11px] text-white/20">{timeAgo}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg px-2.5 py-1.5 text-[11px] text-white/30 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white/60"
              title="Open original article"
            >
              Open original ↗
            </a>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-white/30 ring-1 ring-white/10 transition hover:bg-white/5 hover:text-white/60"
              title="Close (Esc)"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-8 sm:px-10">
          {loading ? (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 w-3/4 rounded bg-white/5" />
              <div className="h-4 w-1/3 rounded bg-white/5" />
              <div className="mt-8 space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-4 rounded bg-white/[0.03]"
                    style={{ width: `${70 + Math.random() * 30}%` }}
                  />
                ))}
              </div>
            </div>
          ) : article ? (
            <>
              <h1 className="mb-3 text-2xl font-bold leading-tight text-white/90 sm:text-3xl">
                {article.title || item.title}
              </h1>

              {(article.byline || article.siteName) && (
                <p className="mb-6 text-sm text-white/35">
                  {article.byline}
                  {article.byline && article.siteName && " · "}
                  {article.siteName}
                </p>
              )}

              <div
                className="article-content prose prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}
