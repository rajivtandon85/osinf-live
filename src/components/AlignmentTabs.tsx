"use client";

import { FeedSource } from "@/types/feed";
import { getSourcesForAlignment } from "@/lib/sources";
import { useMemo, useState } from "react";

interface AlignmentTabsProps {
  selected: "west" | "neutral";
  onSelect: (alignment: "west" | "neutral") => void;
  westCount: number;
  neutralCount: number;
}

const TABS: { id: "west" | "neutral"; label: string; sublabel: string }[] = [
  { id: "west", label: "WEST", sublabel: "NATO / Five Eyes aligned" },
  { id: "neutral", label: "NEUTRAL", sublabel: "Independent / counter-narrative" },
];

export function AlignmentTabs({
  selected,
  onSelect,
  westCount,
  neutralCount,
}: AlignmentTabsProps) {
  const [showSources, setShowSources] = useState(false);
  const sources = useMemo(() => getSourcesForAlignment(selected), [selected]);

  const counts = { west: westCount, neutral: neutralCount };

  return (
    <div className="border-b border-white/5">
      {/* Tab buttons */}
      <div className="mx-auto flex max-w-7xl items-stretch">
        {TABS.map((tab) => {
          const isSelected = selected === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              className={`
                relative flex-1 px-6 py-3 text-center transition-all
                ${
                  isSelected
                    ? tab.id === "west"
                      ? "bg-blue-500/8 text-blue-300"
                      : "bg-emerald-500/8 text-emerald-300"
                    : "text-white/30 hover:text-white/50 hover:bg-white/[0.02]"
                }
              `}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="text-xs font-bold tracking-widest">{tab.label}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isSelected
                      ? tab.id === "west"
                        ? "bg-blue-500/20 text-blue-400"
                        : "bg-emerald-500/20 text-emerald-400"
                      : "bg-white/5 text-white/25"
                  }`}
                >
                  {counts[tab.id]}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-white/20">{tab.sublabel}</p>
              {isSelected && (
                <div
                  className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                    tab.id === "west" ? "bg-blue-500" : "bg-emerald-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Source list toggle */}
      <div className="mx-auto max-w-7xl px-4 py-2">
        <button
          onClick={() => setShowSources(!showSources)}
          className="flex items-center gap-1.5 text-[11px] text-white/25 transition hover:text-white/40"
        >
          <span className={`transition-transform ${showSources ? "rotate-90" : ""}`}>
            ▸
          </span>
          <span>
            {sources.length} sources
          </span>
        </button>

        {showSources && (
          <div className="mt-2 rounded-lg bg-white/[0.02] p-3 ring-1 ring-white/5">
            <div className="flex flex-wrap gap-1.5">
              {sources.map((s) => (
                <span
                  key={s.id}
                  className={`rounded-full px-2 py-0.5 text-[10px] ring-1 ${
                    s.alignment === "west"
                      ? "text-blue-400/70 bg-blue-500/5 ring-blue-500/20"
                      : "text-emerald-400/70 bg-emerald-500/5 ring-emerald-500/20"
                  }`}
                  title={`${s.description}${s.country ? ` (${s.country})` : ""}`}
                >
                  {s.name}
                  {s.country && (
                    <span className="ml-1 text-white/15">· {s.country}</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
