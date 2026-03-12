"use client";

import { useState } from "react";
import { AlertKeyword, AlertMatch, CategoryId, FeedItem } from "@/types/feed";
import { CATEGORIES } from "@/lib/sources";
import { FeedCard } from "./FeedCard";

interface AlertsPanelProps {
  keywords: AlertKeyword[];
  matches: AlertMatch[];
  onAddKeyword: (keyword: string, categories?: CategoryId[]) => Promise<void>;
  onDeleteKeyword: (id: string) => Promise<void>;
  onClose: () => void;
  onRead: (item: FeedItem) => void;
}

export function AlertsPanel({
  keywords,
  matches,
  onAddKeyword,
  onDeleteKeyword,
  onClose,
  onRead,
}: AlertsPanelProps) {
  const [input, setInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [tab, setTab] = useState<"keywords" | "matches">("matches");

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    setAdding(true);
    try {
      await onAddKeyword(input.trim());
      setInput("");
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col border-l border-white/10 bg-[#0d0d14] shadow-2xl sm:w-[480px]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
          <h2 className="text-sm font-semibold text-white/80">Keyword Alerts</h2>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-white/30 transition hover:bg-white/5 hover:text-white/70"
          >
            ✕
          </button>
        </div>

        {/* Add keyword form */}
        <form onSubmit={handleAdd} className="border-b border-white/5 px-5 py-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Taiwan, ransomware, Hormuz…"
              className="flex-1 rounded-lg bg-white/5 px-3 py-2 text-sm text-white/80 placeholder-white/20 ring-1 ring-white/10 outline-none transition focus:ring-white/20"
            />
            <button
              type="submit"
              disabled={adding || !input.trim()}
              className="rounded-lg bg-blue-600/30 px-4 py-2 text-xs font-medium text-blue-300 ring-1 ring-blue-500/30 transition hover:bg-blue-600/50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {adding ? "…" : "Add"}
            </button>
          </div>
          <p className="mt-1.5 text-[11px] text-white/25">
            Alerts fire on the next feed refresh when any feed item contains this keyword.
          </p>
        </form>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {(["matches", "keywords"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-medium capitalize transition ${
                tab === t
                  ? "border-b-2 border-blue-500 text-blue-400"
                  : "text-white/30 hover:text-white/50"
              }`}
            >
              {t}
              {t === "matches" && matches.length > 0 && (
                <span className="ml-1.5 rounded-full bg-red-500/20 px-1.5 py-0.5 text-[10px] text-red-400">
                  {matches.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-thin">
          {tab === "keywords" ? (
            <div className="flex flex-col gap-2">
              {keywords.length === 0 ? (
                <p className="py-8 text-center text-sm text-white/25">
                  No keywords yet. Add one above.
                </p>
              ) : (
                keywords.map((kw) => (
                  <div
                    key={kw.id}
                    className="flex items-center justify-between rounded-lg bg-white/[0.03] px-3 py-2.5 ring-1 ring-white/5"
                  >
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium text-white/70">
                        {kw.keyword}
                      </span>
                      {kw.categories && kw.categories.length > 0 && (
                        <div className="flex gap-1">
                          {kw.categories.map((c) => (
                            <span
                              key={c}
                              className={`text-[10px] ${CATEGORIES[c].color}`}
                            >
                              {CATEGORIES[c].icon} {CATEGORIES[c].label}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={() => onDeleteKeyword(kw.id)}
                      className="ml-3 rounded p-1 text-white/20 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {matches.length === 0 ? (
                <p className="py-8 text-center text-sm text-white/25">
                  No matches yet. Add keywords and refresh feeds.
                </p>
              ) : (
                matches.slice(0, 50).map((m) => (
                  <FeedCard
                    key={m.itemId}
                    item={m.item}
                    isAlert
                    alertKeyword={m.keyword}
                    onRead={onRead}
                  />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
