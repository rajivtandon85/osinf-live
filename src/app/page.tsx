"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { FeedItem, CategoryId, AlertKeyword, AlertMatch } from "@/types/feed";
import { Header } from "@/components/Header";
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

type Perspective = "all" | "west" | "neutral";
type Preset = "none" | "threat-intel" | "conflict-watch";
type PrimaryChip = "all" | CategoryId | "osint" | "osinf";

const CHIP_LABELS: Record<PrimaryChip, string> = {
  all: "All",
  geopolitical: "Geopolitical",
  cyber: "Cyber",
  maritime: "Maritime",
  aviation: "Aviation",
  environmental: "Environmental",
  "dark-web": "Dark Web",
  osint: "OSINT",
  osinf: "OSINF",
};

const CHIP_ORDER: PrimaryChip[] = [
  "all",
  "geopolitical",
  "cyber",
  "maritime",
  "aviation",
  "environmental",
  "dark-web",
  "osint",
  "osinf",
];

export default function Dashboard() {
  const router = useRouter();

  const [items, setItems] = useState<FeedItem[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<string | null>(null);
  const [selectedChip, setSelectedChip] = useState<PrimaryChip>("all");
  const [perspective, setPerspective] = useState<Perspective>("all");
  const [preset, setPreset] = useState<Preset>("none");
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
  const [chipCounts, setChipCounts] = useState<Record<PrimaryChip, number>>({
    all: 0,
    geopolitical: 0,
    cyber: 0,
    maritime: 0,
    aviation: 0,
    environmental: 0,
    "dark-web": 0,
    osint: 0,
    osinf: 0,
  });

  const resolveFilters = useCallback((chip: PrimaryChip) => {
    const category: CategoryId | "all" =
      chip === "all" || chip === "osint" || chip === "osinf" ? "all" : chip;
    const sourceType: "all" | "osint" | "osinf" =
      chip === "osint" || chip === "osinf" ? chip : "all";
    return { category, sourceType };
  }, []);

  const fetchFeeds = useCallback(
    async (
      chip: PrimaryChip = selectedChip,
      perspectiveFilter: Perspective = perspective,
      pg = 1,
      q: string = searchQuery,
      presetFilter: Preset = preset
    ) => {
      setIsLoading(true);
      try {
        const { category, sourceType } = resolveFilters(chip);
        const params = new URLSearchParams({ page: String(pg), limit: "30" });

        if (category !== "all") params.set("category", category);
        if (sourceType !== "all") params.set("sourceType", sourceType);
        if (perspectiveFilter !== "all") params.set("alignment", perspectiveFilter);
        if (q.trim()) params.set("q", q.trim());
        if (presetFilter !== "none") params.set("preset", presetFilter);

        const res = await fetch(`/api/feeds?${params}`);
        const json: FeedResponse = await res.json();
        if (json.success) {
          setItems(json.data.items);
          setLastRefreshed(json.data.lastRefreshed);
          setTotalPages(json.data.totalPages);
          setPage(pg);
          setSearchResultCount(q.trim() ? json.data.total : null);
        }
      } catch {
        // ignore transient network failures
      } finally {
        setIsLoading(false);
      }
    },
    [selectedChip, perspective, searchQuery, preset, resolveFilters]
  );

  const fetchChipCounts = useCallback(async () => {
    if (preset !== "none") {
      setChipCounts((prev) => ({ ...prev, all: items.length }));
      return;
    }

    try {
      const responses = await Promise.all(
        CHIP_ORDER.map(async (chip) => {
          const { category, sourceType } = resolveFilters(chip);
          const params = new URLSearchParams({ limit: "1", page: "1" });
          if (category !== "all") params.set("category", category);
          if (sourceType !== "all") params.set("sourceType", sourceType);
          if (perspective !== "all") params.set("alignment", perspective);
          if (searchQuery.trim()) params.set("q", searchQuery.trim());
          const res = await fetch(`/api/feeds?${params}`);
          const json: FeedResponse = await res.json();
          return [chip, json.success ? json.data.total : 0] as const;
        })
      );

      setChipCounts(Object.fromEntries(responses) as Record<PrimaryChip, number>);
    } catch {
      // keep last known counts
    }
  }, [items.length, perspective, preset, resolveFilters, searchQuery]);

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
        fetchFeeds(selectedChip, perspective, 1, searchQuery, preset),
        fetchChipCounts(),
        fetchAlerts(),
      ]);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleChipChange = (chip: PrimaryChip) => {
    setPreset("none");
    setSelectedChip(chip);
    setSelectedCategory("all");
    fetchFeeds(chip, perspective, 1, searchQuery, "none");
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setSelectedCategory("all");
    fetchFeeds(selectedChip, perspective, 1, q, preset);
  };

  const handlePerspectiveChange = (next: Perspective) => {
    setPerspective(next);
    setSelectedCategory("all");
    fetchFeeds(selectedChip, next, 1, searchQuery, preset);
  };

  const handlePreset = (next: Preset) => {
    setPreset(next);
    setSelectedChip("all");
    setSelectedCategory("all");
    fetchFeeds("all", perspective, 1, searchQuery, next);
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
    counts.all = items.length;
    for (const item of items) {
      counts[item.category] = (counts[item.category] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    if (selectedCategory === "all") return items;
    return items.filter((item) => item.category === selectedCategory);
  }, [items, selectedCategory]);

  const alertItemIds = useMemo(() => new Set(matches.map((m) => m.itemId)), [matches]);
  const alertKeywordMap = useMemo(() => Object.fromEntries(matches.map((m) => [m.itemId, m.keyword])), [matches]);

  useEffect(() => {
    fetchFeeds("all", "all", 1, "", "none");
    fetchChipCounts();
    fetchAlerts();

    const interval = setInterval(() => {
      fetchFeeds();
      fetchChipCounts();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchChipCounts();
  }, [perspective, preset, searchQuery, fetchChipCounts]);

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      <Header
        lastRefreshed={lastRefreshed}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
        alertCount={matches.length}
        onAlertsClick={() => setShowAlerts(true)}
      />

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-4">
          <SearchBar
            value={searchQuery}
            onChange={handleSearch}
            resultCount={searchResultCount}
            isSearching={isLoading && searchQuery.trim().length > 0}
          />
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          {CHIP_ORDER.map((chip) => (
            <button
              key={chip}
              onClick={() => handleChipChange(chip)}
              className={`rounded-full px-3 py-1.5 text-xs ring-1 transition ${
                selectedChip === chip && preset === "none"
                  ? "bg-cyan-500/15 text-cyan-300 ring-cyan-400/35"
                  : "bg-white/[0.02] text-[var(--text)]/55 ring-white/10 hover:text-[var(--text)]/85"
              }`}
            >
              {CHIP_LABELS[chip]} <span className="text-[var(--muted)]">{chipCounts[chip] ?? 0}</span>
            </button>
          ))}

          <div className="ml-auto flex items-center gap-2">
            <span className="text-xs text-[var(--muted)]">Perspective</span>
            <select
              value={perspective}
              onChange={(e) => handlePerspectiveChange(e.target.value as Perspective)}
              className="rounded-md border border-[var(--line)] bg-[var(--panel)] px-2 py-1.5 text-xs text-[var(--text)]"
            >
              <option value="all">All</option>
              <option value="west">West</option>
              <option value="neutral">Neutral</option>
            </select>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => handlePreset("threat-intel")}
            className={`rounded-md px-3 py-1.5 text-xs ring-1 transition ${
              preset === "threat-intel"
                ? "bg-amber-500/15 text-amber-300 ring-amber-400/35"
                : "bg-white/[0.02] text-[var(--text)]/60 ring-white/10 hover:text-[var(--text)]"
            }`}
          >
            Threat Intel
          </button>
          <button
            onClick={() => handlePreset("conflict-watch")}
            className={`rounded-md px-3 py-1.5 text-xs ring-1 transition ${
              preset === "conflict-watch"
                ? "bg-amber-500/15 text-amber-300 ring-amber-400/35"
                : "bg-white/[0.02] text-[var(--text)]/60 ring-white/10 hover:text-[var(--text)]"
            }`}
          >
            Conflict Watch
          </button>
          {preset !== "none" && (
            <button
              onClick={() => handlePreset("none")}
              className="rounded-md bg-white/[0.02] px-3 py-1.5 text-xs text-[var(--text)]/65 ring-1 ring-white/10 transition hover:text-[var(--text)]"
            >
              Clear Preset
            </button>
          )}
        </div>

        <div className="mb-5">
          <CategoryFilter selected={selectedCategory} onSelect={setSelectedCategory} counts={categoryCounts} />
        </div>

        <div className="mb-5">
          <AdSlot label="Top Banner Ad (728x90)" className="min-h-[92px]" />
        </div>

        <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
          <FeedTimeline
            items={filteredItems}
            alertItemIds={alertItemIds}
            alertKeywordMap={alertKeywordMap}
            isLoading={isLoading}
            onRead={handleRead}
          />
          <aside className="space-y-4">
            <AdSlot label="Right Rail Ad (300x600)" className="sticky top-24" />
          </aside>
        </div>

        {totalPages > 1 && (
          <div className="mt-8 flex items-center justify-center gap-3">
            <button
              onClick={() => fetchFeeds(selectedChip, perspective, page - 1, searchQuery, preset)}
              disabled={page <= 1}
              className="rounded-md bg-white/5 px-4 py-2 text-xs text-[var(--muted)] ring-1 ring-white/10 transition hover:bg-white/10 hover:text-[var(--text)]/70 disabled:cursor-not-allowed disabled:opacity-30"
            >
              ← Prev
            </button>
            <span className="text-xs text-[var(--muted)]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => fetchFeeds(selectedChip, perspective, page + 1, searchQuery, preset)}
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
