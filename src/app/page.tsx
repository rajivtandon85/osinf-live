"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FeedItem, CategoryId, AlertKeyword, AlertMatch } from "@/types/feed";
import { Header } from "@/components/Header";
import { AlignmentTabs } from "@/components/AlignmentTabs";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { FeedTimeline } from "@/components/FeedTimeline";
import { AlertsPanel } from "@/components/AlertsPanel";
import { AdSlot } from "@/components/AdSlot";

interface FeedResponse {
  success: boolean;
  data: {
    items: FeedItem[];
    total: number;
    page: number;
    totalPages: number;
    lastRefreshed: string | null;
  };
}

interface AlertsResponse {
  success: boolean;
  data: {
    keywords: AlertKeyword[];
    matches: AlertMatch[];
  };
}

export default function Dashboard() {
  const [items, setItems] = useState<FeedItem[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [alignment, setAlignment] = useState<"west" | "neutral">("neutral");
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | "all">("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);
  const [keywords, setKeywords] = useState<AlertKeyword[]>([]);
  const [matches, setMatches] = useState<AlertMatch[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResultCount, setSearchResultCount] = useState<number | null>(null);
  const [sourceTypeFilter, setSourceTypeFilter] = useState<"all" | "news" | "osint" | "osinf">("all");
  const router = useRouter();

  // We also need total counts for the alignment tabs, so fetch both counts
  const [westCount, setWestCount] = useState(0);
  const [neutralCount, setNeutralCount] = useState(0);

  const fetchFeeds = useCallback(
    async (
      align: "west" | "neutral" = alignment,
      cat: CategoryId | "all" = selectedCategory,
      pg = 1,
      q: string = searchQuery,
      sourceType: "all" | "news" | "osint" | "osinf" = sourceTypeFilter
    ) => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(pg),
          limit: "30",
          alignment: align,
        });
        if (cat !== "all") params.set("category", cat);
        if (q.trim()) params.set("q", q.trim());
        if (sourceType !== "all") params.set("sourceType", sourceType);
        const res = await fetch(`/api/feeds?${params}`);
        const json: FeedResponse = await res.json();
        if (json.success) {
          setItems(json.data.items);
          setLastRefreshed(json.data.lastRefreshed);
          setTotalPages(json.data.totalPages);
          setPage(pg);
          setSearchResultCount(q.trim() ? json.data.total : null);
        }
      } catch { /* silently ignore network errors from background refresh */ } finally {
        setIsLoading(false);
      }
    },
    [alignment, selectedCategory, searchQuery, sourceTypeFilter]
  );

  const fetchTabCounts = useCallback(async () => {
    try {
      const [wRes, nRes] = await Promise.all([
        fetch("/api/feeds?alignment=west&limit=1"),
        fetch("/api/feeds?alignment=neutral&limit=1"),
      ]);
      const [wJson, nJson]: FeedResponse[] = await Promise.all([
        wRes.json(),
        nRes.json(),
      ]);
      if (wJson.success) setWestCount(wJson.data.total);
      if (nJson.success) setNeutralCount(nJson.data.total);
    } catch { /* silently ignore network errors from background refresh */ }
  }, []);

  const fetchAlerts = useCallback(async () => {
    const res = await fetch("/api/alerts");
    const json: AlertsResponse = await res.json();
    if (json.success) {
      setKeywords(json.data.keywords);
      setMatches(json.data.matches);
    }
  }, []);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await fetch("/api/feeds/refresh", { method: "POST" });
      await Promise.all([
        fetchFeeds(alignment, selectedCategory, 1, searchQuery, sourceTypeFilter),
        fetchTabCounts(),
        fetchAlerts(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleAlignmentChange = (a: "west" | "neutral") => {
    setAlignment(a);
    setSelectedCategory("all");
    setSearchQuery("");
    setSearchResultCount(null);
    setSourceTypeFilter("all");
    fetchFeeds(a, "all", 1, "", "all");
  };

  const handleCategoryChange = (cat: CategoryId | "all") => {
    setSelectedCategory(cat);
    fetchFeeds(alignment, cat, 1, searchQuery, sourceTypeFilter);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    fetchFeeds(alignment, selectedCategory, 1, q, sourceTypeFilter);
  };

  const handleSourceTypeChange = (next: "all" | "news" | "osint" | "osinf") => {
    setSourceTypeFilter(next);
    fetchFeeds(alignment, selectedCategory, 1, searchQuery, next);
  };

  const handleRead = (item: FeedItem) => {
    const from = encodeURIComponent(window.location.pathname + window.location.search);
    router.push(`/read/${item.id}?from=${from}`);
  };

  const handleAddKeyword = async (keyword: string, categories?: CategoryId[]) => {
    await fetch("/api/alerts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword, categories }),
    });
    await fetchAlerts();
  };

  const handleDeleteKeyword = async (id: string) => {
    await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
    await fetchAlerts();
  };

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<CategoryId | "all", number>> = {};
    counts["all"] = items.length;
    for (const item of items) {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  const alertItemIds = useMemo(
    () => new Set(matches.map((m) => m.itemId)),
    [matches]
  );
  const alertKeywordMap = useMemo(
    () => Object.fromEntries(matches.map((m) => [m.itemId, m.keyword])),
    [matches]
  );

  const sourceTypeCounts = useMemo(() => {
    const counts = { all: items.length, news: 0, osint: 0, osinf: 0 };
    for (const item of items) {
      counts[item.sourceType]++;
    }
    return counts;
  }, [items]);

  useEffect(() => {
    fetchFeeds("neutral", "all", 1, "");
    fetchTabCounts();
    fetchAlerts();

    // Auto-refresh feeds every 5 minutes
    const interval = setInterval(() => {
      fetchFeeds();
      fetchTabCounts();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header
        lastRefreshed={lastRefreshed}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        alertCount={matches.length}
        onAlertsClick={() => setShowAlerts(true)}
      />

      {/* Alignment tabs */}
      <AlignmentTabs
        selected={alignment}
        onSelect={handleAlignmentChange}
        westCount={westCount}
        neutralCount={neutralCount}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5">
          <AdSlot label="Top Banner Ad (728x90)" className="min-h-[92px]" />
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            resultCount={searchResultCount}
            isSearching={isLoading && searchQuery.trim().length > 0}
          />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {([
            ["all", "All"],
            ["osint", "OSINT"],
            ["osinf", "OSINF"],
            ["news", "News"],
          ] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => handleSourceTypeChange(key)}
              className={`rounded-full px-3 py-1.5 text-xs ring-1 transition ${
                sourceTypeFilter === key
                  ? "bg-cyan-500/15 text-cyan-300 ring-cyan-400/35"
                  : "bg-white/[0.02] text-[var(--text)]/50 ring-white/10 hover:text-[var(--text)]/75"
              }`}
            >
              {label} <span className="text-[var(--muted)]">{sourceTypeCounts[key]}</span>
            </button>
          ))}
          <span className="ml-auto text-[11px] text-[var(--muted)]">Tip: press `/` to search fast</span>
        </div>

        {/* Category filter */}
        <div className="mb-5">
          <CategoryFilter
            selected={selectedCategory}
            onSelect={handleCategoryChange}
            counts={categoryCounts}
          />
        </div>

        {/* Feed grid */}
        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <FeedTimeline
            items={items}
            alertItemIds={alertItemIds}
            alertKeywordMap={alertKeywordMap}
            isLoading={isLoading}
            onRead={handleRead}
          />
          <aside className="space-y-4">
            <AdSlot label="Right Rail Ad (300x600)" className="sticky top-24" />
          </aside>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => fetchFeeds(alignment, selectedCategory, page - 1, searchQuery, sourceTypeFilter)}
              disabled={page <= 1}
              className="rounded-md bg-white/5 px-4 py-2 text-xs text-[var(--muted)] ring-1 ring-white/10 transition hover:bg-white/10 hover:text-[var(--text)]/70 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="text-xs text-[var(--muted)]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => fetchFeeds(alignment, selectedCategory, page + 1, searchQuery, sourceTypeFilter)}
              disabled={page >= totalPages}
              className="rounded-md bg-white/5 px-4 py-2 text-xs text-[var(--muted)] ring-1 ring-white/10 transition hover:bg-white/10 hover:text-[var(--text)]/70 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next →
            </button>
          </div>
        )}
      </main>

      {showAlerts && (
        <AlertsPanel
          keywords={keywords}
          matches={matches}
          onAddKeyword={handleAddKeyword}
          onDeleteKeyword={handleDeleteKeyword}
          onClose={() => setShowAlerts(false)}
          onRead={handleRead}
        />
      )}
    </div>
  );
}
