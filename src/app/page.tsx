"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { FeedItem, CategoryId, AlertKeyword, AlertMatch } from "@/types/feed";
import { CATEGORIES } from "@/lib/sources";
import { Header } from "@/components/Header";
import { AlignmentTabs } from "@/components/AlignmentTabs";
import { SearchBar } from "@/components/SearchBar";
import { CategoryFilter } from "@/components/CategoryFilter";
import { FeedTimeline } from "@/components/FeedTimeline";
import { AlertsPanel } from "@/components/AlertsPanel";
import { ArticleReader } from "@/components/ArticleReader";

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
  const [readingItem, setReadingItem] = useState<FeedItem | null>(null);

  // We also need total counts for the alignment tabs, so fetch both counts
  const [westCount, setWestCount] = useState(0);
  const [neutralCount, setNeutralCount] = useState(0);

  const fetchFeeds = useCallback(
    async (
      align: "west" | "neutral" = alignment,
      cat: CategoryId | "all" = selectedCategory,
      pg = 1,
      q: string = searchQuery
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
        const res = await fetch(`/api/feeds?${params}`);
        const json: FeedResponse = await res.json();
        if (json.success) {
          setItems(json.data.items);
          setLastRefreshed(json.data.lastRefreshed);
          setTotalPages(json.data.totalPages);
          setPage(pg);
          setSearchResultCount(q.trim() ? json.data.total : null);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [alignment, selectedCategory, searchQuery]
  );

  const fetchTabCounts = useCallback(async () => {
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
        fetchFeeds(alignment, selectedCategory, 1, searchQuery),
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
    fetchFeeds(a, "all", 1, "");
  };

  const handleCategoryChange = (cat: CategoryId | "all") => {
    setSelectedCategory(cat);
    fetchFeeds(alignment, cat, 1, searchQuery);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    fetchFeeds(alignment, selectedCategory, 1, q);
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

  useEffect(() => {
    fetchFeeds("neutral", "all", 1, "");
    fetchTabCounts();
    fetchAlerts();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
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
        {/* Search bar */}
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            resultCount={searchResultCount}
            isSearching={isLoading && searchQuery.trim().length > 0}
          />
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
        <FeedTimeline
          items={items}
          alertItemIds={alertItemIds}
          alertKeywordMap={alertKeywordMap}
          isLoading={isLoading}
          onRead={setReadingItem}
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => fetchFeeds(alignment, selectedCategory, page - 1, searchQuery)}
              disabled={page <= 1}
              className="rounded-md bg-white/5 px-4 py-2 text-xs text-white/40 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="text-xs text-white/25">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => fetchFeeds(alignment, selectedCategory, page + 1, searchQuery)}
              disabled={page >= totalPages}
              className="rounded-md bg-white/5 px-4 py-2 text-xs text-white/40 ring-1 ring-white/10 transition hover:bg-white/10 hover:text-white/70 disabled:cursor-not-allowed disabled:opacity-30"
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
          onRead={setReadingItem}
        />
      )}

      {readingItem && (
        <ArticleReader
          item={readingItem}
          onClose={() => setReadingItem(null)}
        />
      )}
    </div>
  );
}
