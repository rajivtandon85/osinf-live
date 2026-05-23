"use client";

import { FeedItem } from "@/types/feed";
import { FeedCard } from "./FeedCard";
import { InFeedAd } from "./InFeedAd";

interface FeedTimelineProps {
  items: FeedItem[];
  alertItemIds: Set<string>;
  alertKeywordMap: Record<string, string>;
  isLoading: boolean;
  onRead: (item: FeedItem) => void;
}

export function FeedTimeline({
  items,
  alertItemIds,
  alertKeywordMap,
  isLoading,
  onRead,
}: FeedTimelineProps) {
  if (isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="h-36 animate-pulse rounded-xl border border-white/5 bg-white/[0.02]"
          />
        ))}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <div className="text-4xl opacity-20">◈</div>
        <p className="text-sm text-[var(--muted)]">No items found. Try refreshing.</p>
      </div>
    );
  }

  const seen = new Set<string>();
  const deduped = items.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  const FEED_AD_INTERVAL = 8;
  const withAds: Array<{ kind: "item"; item: FeedItem } | { kind: "ad"; key: string }> = [];
  deduped.forEach((item, idx) => {
    withAds.push({ kind: "item", item });
    if ((idx + 1) % FEED_AD_INTERVAL === 0 && idx !== deduped.length - 1) {
      withAds.push({ kind: "ad", key: `infeed-${idx}` });
    }
  });

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {withAds.map((entry) =>
        entry.kind === "ad" ? (
          <InFeedAd key={entry.key} className="sm:col-span-2 lg:col-span-3" />
        ) : (
          <FeedCard
            key={entry.item.id}
            item={entry.item}
            isAlert={alertItemIds.has(entry.item.id)}
            alertKeyword={alertKeywordMap[entry.item.id]}
            onRead={onRead}
          />
        )
      )}
    </div>
  );
}
