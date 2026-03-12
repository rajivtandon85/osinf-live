import Parser from "rss-parser";
import crypto from "crypto";
import { FeedItem, FeedSource } from "@/types/feed";
import { FEED_SOURCES } from "./sources";
import { redis, CACHE_KEYS, CACHE_TTL_SECONDS } from "./redis";
import { AlertKeyword } from "@/types/feed";

const parser = new Parser({
  timeout: 8000,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; OSINF-Dashboard/1.0; +https://github.com/osinf-dashboard)",
    Accept: "application/rss+xml, application/xml, text/xml, */*",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
      ["enclosure", "enclosure"],
    ],
  },
});

function extractImage(item: Record<string, unknown>): string | undefined {
  const mediaContent = item.mediaContent as { $?: { url?: string } } | undefined;
  const mediaThumbnail = item.mediaThumbnail as { $?: { url?: string } } | undefined;
  const enclosure = item.enclosure as { url?: string; type?: string } | undefined;

  if (mediaContent?.$?.url) return mediaContent.$.url;
  if (mediaThumbnail?.$?.url) return mediaThumbnail.$.url;
  if (enclosure?.url && enclosure?.type?.startsWith("image/")) return enclosure.url;

  // Try extracting from content/summary HTML
  const html = (item.content as string) || (item.summary as string) || "";
  const match = html.match(/<img[^>]+src="([^"]+)"/i);
  return match?.[1];
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function makeId(sourceId: string, link: string, title: string): string {
  return crypto
    .createHash("sha1")
    .update(`${sourceId}:${link}:${title}`)
    .digest("hex")
    .slice(0, 16);
}

const NON_ENGLISH_MARKERS = new RegExp(
  [
    // French
    "\\b(le|la|les|des|du|un|une|pour|dans|sur|est|avec|aux|ces|sont|qui|par|ont|été|mais|ou|où|cette|ses|leur|aussi|peut|fait|après|entre|nous|vous|ils|elle|elles|tout|tous|plus)\\b",
    // Spanish / Portuguese
    "\\b(el|los|las|del|por|para|con|una|como|más|está|son|pero|sus|fue|han|sobre|desde|muy|tiene|puede|hasta|entre|cuando|todo|sin|nos|después|antes|cada|donde|otro|otra|otros|años|según|dois|pelo|pela|isso|foram|ainda|mesmo)\\b",
    // German
    "\\b(der|die|das|und|ist|von|mit|den|dem|ein|eine|für|auf|sich|nicht|auch|als|noch|nach|bei|oder|nur|wird|aber|wie|vor|zur|über|werden|haben|kann|dass|mehr|wenn|schon|waren|zwei|sehr)\\b",
    // Arabic script
    "[\\u0600-\\u06FF]{3,}",
    // CJK (Chinese/Japanese/Korean)
    "[\\u4E00-\\u9FFF\\u3040-\\u309F\\u30A0-\\u30FF]{2,}",
    // Cyrillic (Russian, Ukrainian, etc.)
    "[\\u0400-\\u04FF]{3,}",
    // Devanagari (Hindi)
    "[\\u0900-\\u097F]{3,}",
    // Bengali
    "[\\u0980-\\u09FF]{3,}",
  ].join("|"),
  "i"
);

function isLikelyEnglish(title: string, summary: string): boolean {
  const text = `${title} ${summary}`.trim();
  if (!text) return true;
  // If title alone matches multiple non-English markers, skip it
  const titleMatches = title.match(NON_ENGLISH_MARKERS);
  if (titleMatches && title.split(/\s+/).length > 3) {
    const words = title.split(/\s+/).length;
    const matchRatio = (title.match(new RegExp(NON_ENGLISH_MARKERS, "gi")) || []).length / words;
    if (matchRatio > 0.25) return false;
  }
  // Non-Latin script check on title alone
  if (/[\u0600-\u06FF\u4E00-\u9FFF\u3040-\u30FF\u0400-\u04FF\u0900-\u097F\u0980-\u09FF]{3,}/.test(title)) {
    return false;
  }
  return true;
}

function normalizeTags(categories: unknown): string[] | undefined {
  if (!categories || !Array.isArray(categories)) return undefined;
  return categories
    .map((c: unknown) => {
      if (typeof c === "string") return c;
      if (c && typeof c === "object" && "_" in c) return String((c as Record<string, unknown>)._);
      if (c && typeof c === "object" && "$" in c) {
        const attrs = (c as Record<string, unknown>).$ as Record<string, unknown> | undefined;
        return attrs?.term ? String(attrs.term) : undefined;
      }
      return undefined;
    })
    .filter((t): t is string => typeof t === "string" && t.length > 0);
}

async function fetchSource(source: FeedSource): Promise<FeedItem[]> {
  try {
    const feed = await parser.parseURL(source.url);
    return (feed.items || []).slice(0, 25)
      .map((item) => {
        const rawItem = item as unknown as Record<string, unknown>;
        const link = item.link || item.guid || source.url;
        const title = stripHtml(item.title || "Untitled");
        const summary = stripHtml(
          item.contentSnippet || item.summary || item.content || ""
        ).slice(0, 300);
        return {
          id: makeId(source.id, link, title),
          title,
          summary,
          url: link,
          sourceId: source.id,
          sourceName: source.name,
          category: source.category,
          alignment: source.alignment,
          publishedAt:
            item.isoDate ||
            item.pubDate ||
            new Date().toISOString(),
          imageUrl: extractImage(rawItem),
          tags: normalizeTags(item.categories),
        };
      })
      .filter((item) => isLikelyEnglish(item.title, item.summary));
  } catch (err) {
    console.error(`[feed] Failed to fetch ${source.id}:`, (err as Error).message);
    return [];
  }
}

export async function refreshAllFeeds(): Promise<{
  count: number;
  sources: number;
  errors: number;
}> {
  const results = await Promise.allSettled(
    FEED_SOURCES.map((s) => fetchSource(s))
  );

  const allItems: FeedItem[] = [];
  let errors = 0;

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      allItems.push(...result.value);
    } else {
      errors++;
    }
  });

  // Deduplicate by id
  const seen = new Set<string>();
  const unique = allItems.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });

  // Sort newest first
  unique.sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  // Store in Redis
  const serialized = JSON.stringify(unique);
  await redis.set(CACHE_KEYS.allFeeds, serialized, { ex: CACHE_TTL_SECONDS });
  await redis.set(CACHE_KEYS.lastRefreshed, new Date().toISOString(), {
    ex: CACHE_TTL_SECONDS * 2,
  });

  // Check alerts
  await checkAlerts(unique);

  return {
    count: unique.length,
    sources: FEED_SOURCES.length,
    errors,
  };
}

export async function getCachedFeeds(): Promise<FeedItem[]> {
  const cached = await redis.get(CACHE_KEYS.allFeeds);
  if (!cached) return [];
  try {
    if (Array.isArray(cached)) return cached as FeedItem[];
    return JSON.parse(cached as string) as FeedItem[];
  } catch {
    return [];
  }
}

export async function getLastRefreshed(): Promise<string | null> {
  const ts = await redis.get(CACHE_KEYS.lastRefreshed);
  return (ts as string) || null;
}

async function checkAlerts(items: FeedItem[]): Promise<void> {
  const raw = await redis.get(CACHE_KEYS.alerts);
  if (!raw) return;

  let keywords: AlertKeyword[] = [];
  try {
    keywords = JSON.parse(raw as string);
  } catch {
    return;
  }

  if (!keywords.length) return;

  const existingRaw = await redis.get(CACHE_KEYS.alertMatches);
  const existing = existingRaw
    ? (JSON.parse(existingRaw as string) as { itemId: string }[])
    : [];
  const seenIds = new Set(existing.map((m) => m.itemId));

  const newMatches: {
    itemId: string;
    keyword: string;
    item: FeedItem;
    matchedAt: string;
  }[] = [];

  for (const item of items) {
    if (seenIds.has(item.id)) continue;
    const searchText = `${item.title} ${item.summary}`.toLowerCase();

    for (const kw of keywords) {
      if (
        kw.categories?.length &&
        !kw.categories.includes(item.category)
      ) {
        continue;
      }
      if (searchText.includes(kw.keyword.toLowerCase())) {
        newMatches.push({
          itemId: item.id,
          keyword: kw.keyword,
          item,
          matchedAt: new Date().toISOString(),
        });
        seenIds.add(item.id);
        break;
      }
    }
  }

  if (newMatches.length) {
    const updated = [...newMatches, ...existing].slice(0, 200);
    await redis.set(CACHE_KEYS.alertMatches, JSON.stringify(updated), {
      ex: CACHE_TTL_SECONDS * 4,
    });
  }
}
