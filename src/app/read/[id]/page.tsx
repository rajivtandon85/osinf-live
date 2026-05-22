"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { formatDistanceToNow } from "date-fns";
import { FeedItem } from "@/types/feed";
import { CATEGORIES } from "@/lib/sources";
import { ThemeToggle } from "@/components/ThemeToggle";
import { AdSlot } from "@/components/AdSlot";

interface ArticleData {
  title: string;
  content: string;
  byline: string;
  siteName: string;
  method?: string;
}

interface ReadResponse {
  success: boolean;
  data?: ArticleData;
  error?: string;
  code?: string;
}

const SKELETON_WIDTHS = [92, 76, 84, 97, 72, 90, 80, 88];

export default function ReaderPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/";

  const [item, setItem] = useState<FeedItem | null>(null);
  const [article, setArticle] = useState<ArticleData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [nextItem, setNextItem] = useState<FeedItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const itemRes = await fetch(`/api/feeds/item?id=${encodeURIComponent(params.id)}`);
        const itemJson = await itemRes.json();
        if (!itemJson.success || !itemJson.data) {
          setError("Could not load this article entry.");
          setLoading(false);
          return;
        }
        if (cancelled) return;
        const feedItem: FeedItem = itemJson.data;
        setItem(feedItem);

        const nextParams = new URLSearchParams({
          category: feedItem.category,
          page: "1",
          limit: "12",
        });
        const nextRes = await fetch(`/api/feeds?${nextParams}`);
        const nextJson = await nextRes.json();
        if (nextJson?.success && Array.isArray(nextJson?.data?.items)) {
          const candidate = nextJson.data.items.find((candidateItem: FeedItem) => candidateItem.id !== feedItem.id);
          setNextItem(candidate || null);
        }

        const readRes = await fetch(`/api/read?url=${encodeURIComponent(feedItem.url)}`);
        const readJson: ReadResponse = await readRes.json();
        if (cancelled) return;

        if (readJson.success && readJson.data?.content) {
          setArticle(readJson.data);
        } else if (readJson.code === "SOURCE_BLOCKED") {
          setBlocked(true);
          setArticle({
            title: feedItem.title,
            content: `<p>${feedItem.summary || "This publisher blocked full extraction in-app."}</p>`,
            byline: "",
            siteName: feedItem.sourceName,
            method: "feed-summary",
          });
          setError("Publisher protection blocked full extraction. You can still open original below.");
        } else {
          setArticle({
            title: feedItem.title,
            content: `<p>${feedItem.summary || "This source did not expose full text for extraction."}</p>`,
            byline: "",
            siteName: feedItem.sourceName,
            method: "feed-summary",
          });
          setError("Showing feed summary because full extraction was unavailable.");
        }
      } catch {
        if (!cancelled) setError("Failed to load article.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id]);

  const category = useMemo(() => {
    if (!item) return null;
    return CATEGORIES[item.category];
  }, [item]);

  const handleBack = () => {
    router.push(from);
  };

  const handleNext = () => {
    if (!nextItem) return;
    const nextFrom = encodeURIComponent(from);
    router.push(`/read/${nextItem.id}?from=${nextFrom}`);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <header className="sticky top-0 z-50 border-b border-[var(--line)] bg-[var(--bg)]/95 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <button
            onClick={handleBack}
            className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs text-[var(--text)] transition hover:bg-[var(--panel-2)]"
          >
            ← Back to Dashboard
          </button>
          <div className="flex items-center gap-2">
            {nextItem && (
              <button
                onClick={handleNext}
                className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs text-[var(--text)] transition hover:bg-[var(--panel-2)]"
                title={nextItem.title}
              >
                Next in Category →
              </button>
            )}
            <ThemeToggle />
            {item && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-3 py-1.5 text-xs text-[var(--text)] transition hover:bg-[var(--panel-2)]"
              >
                Open Original ↗
              </a>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto grid w-full max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[1fr_280px]">
        <article className="rounded-2xl border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-8">
          {loading && (
            <div className="space-y-4 animate-pulse">
              <div className="h-8 w-3/4 rounded bg-[var(--panel-2)]" />
              <div className="h-4 w-1/3 rounded bg-[var(--panel-2)]" />
              <div className="mt-8 space-y-3">
                {SKELETON_WIDTHS.map((w, i) => (
                  <div key={i} className="h-4 rounded bg-[var(--panel-2)]" style={{ width: `${w}%` }} />
                ))}
              </div>
            </div>
          )}

          {!loading && item && (
            <>
              <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
                {category && (
                  <span className="rounded bg-[var(--panel-2)] px-2 py-0.5 text-[var(--muted)]">
                    {category.label} &gt; {item.sourceType.toUpperCase()}
                  </span>
                )}
                {category && (
                  <span className={`rounded-full px-2 py-0.5 ring-1 ${category.bgColor} ${category.color} ${category.borderColor}`}>
                    {category.icon} {category.label}
                  </span>
                )}
                <span className="rounded bg-[var(--panel-2)] px-2 py-0.5 uppercase">{item.sourceType}</span>
                <span className="text-[var(--muted)]">{item.sourceName}</span>
                <span className="text-[var(--muted)]">•</span>
                <span className="text-[var(--muted)]">
                  {formatDistanceToNow(new Date(item.publishedAt), { addSuffix: true })}
                </span>
              </div>

              <h1 className="mb-3 text-3xl font-bold leading-tight">{article?.title || item.title}</h1>
              {(article?.byline || article?.siteName) && (
                <p className="mb-6 text-sm text-[var(--muted)]">
                  {article?.byline}
                  {article?.byline && article?.siteName && " · "}
                  {article?.siteName}
                </p>
              )}

              {blocked ? (
                <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-4 text-sm text-amber-300">
                  Publisher blocked full article extraction. Showing feed summary in-app.
                </div>
              ) : error ? (
                <div className="rounded-lg border border-amber-500/35 bg-amber-500/10 p-4 text-sm text-amber-300">
                  {error}
                </div>
              ) : (
                <div className="article-content max-w-none" dangerouslySetInnerHTML={{ __html: article?.content || "" }} />
              )}

              <div className="mt-8">
                <AdSlot label="In-Article Ad (300x250)" />
              </div>
            </>
          )}
        </article>

        <aside className="space-y-4">
          <AdSlot label="Sidebar Ad (300x600)" className="sticky top-24" />
        </aside>
      </main>
    </div>
  );
}
