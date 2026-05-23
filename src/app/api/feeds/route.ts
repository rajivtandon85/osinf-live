import { NextRequest, NextResponse } from "next/server";
import { getCachedFeeds, getLastRefreshed, refreshAllFeeds } from "@/lib/feedParser";

export const dynamic = "force-dynamic";

function normalizeItem<T extends { sourceType?: string }>(item: T): T & { sourceType: "news" | "osint" | "osinf" } {
  const sourceType = item.sourceType === "osint" || item.sourceType === "osinf" ? item.sourceType : "news";
  return { ...item, sourceType };
}

function normalizeCountry(country: string): string {
  return country.toLowerCase().replace(/[^a-z]/g, "");
}

function getLocalTokens(localCountry: string): string[] {
  const key = normalizeCountry(localCountry);
  if (key === "philippines") return ["philippines", "philippine", "manila", "cebu", "davao"];
  if (key === "india") return ["india", "indian", "new delhi", "mumbai", "bengaluru", "chennai"];
  if (key === "japan") return ["japan", "japanese", "tokyo", "osaka"];
  if (key === "usa" || key === "unitedstates") return ["united states", "u.s.", "america", "washington", "new york"];
  return [localCountry.toLowerCase()];
}

function localScore(item: { country?: string; title: string; summary: string; sourceName: string }, localCountry: string): number {
  if (!localCountry) return 0;
  const target = normalizeCountry(localCountry);
  const sourceCountry = item.country ? normalizeCountry(item.country) : "";
  const tokens = getLocalTokens(localCountry);
  const haystack = `${item.title} ${item.summary} ${item.sourceName}`.toLowerCase();

  let score = 0;
  if (sourceCountry && (sourceCountry.includes(target) || target.includes(sourceCountry))) score += 6;
  for (const token of tokens) {
    if (haystack.includes(token)) score += 2;
  }
  return score;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");
  const sourceType = searchParams.get("sourceType") as "news" | "osint" | "osinf" | null;
  const preset = searchParams.get("preset") as "threat-intel" | "conflict-watch" | null;
  const localCountry = searchParams.get("localCountry")?.trim() || "";
  const query = searchParams.get("q")?.trim().toLowerCase();
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "30", 10);

  try {
    let items = await getCachedFeeds();

    // If cache is empty, trigger a fresh fetch
    if (items.length === 0) {
      await refreshAllFeeds();
      items = await getCachedFeeds();
    }

    items = items.map((item) => normalizeItem(item));

    if (sourceType) {
      items = items.filter((item) => item.sourceType === sourceType);
    }

    if (category && category !== "all") {
      items = items.filter((item) => item.category === category);
    }

    if (preset === "threat-intel") {
      items = items.filter(
        (item) => item.category === "cyber" || item.category === "dark-web" || item.sourceType === "osinf"
      );
    }

    if (preset === "conflict-watch") {
      items = items.filter((item) => item.category === "geopolitical" || item.sourceType === "osint");
    }

    // Full-text keyword search across title, summary, source name, and tags
    if (query) {
      const terms = query.split(/\s+/).filter(Boolean);
      items = items.filter((item) => {
        const haystack = [
          item.title,
          item.summary,
          item.sourceName,
          ...(item.tags || []),
        ]
          .join(" ")
          .toLowerCase();
        return terms.every((term) => haystack.includes(term));
      });
    }

    if (localCountry) {
      items = items
        .map((item) => ({ item, score: localScore(item, localCountry) }))
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score;
          return new Date(b.item.publishedAt).getTime() - new Date(a.item.publishedAt).getTime();
        })
        .map((entry) => entry.item);
    }

    const total = items.length;
    const start = (page - 1) * limit;
    const paginated = items.slice(start, start + limit);
    const lastRefreshed = await getLastRefreshed();

    return NextResponse.json({
      success: true,
      data: {
        items: paginated,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        lastRefreshed,
      },
    });
  } catch (err) {
    console.error("[api/feeds]", err);
    return NextResponse.json(
      { success: false, error: "Failed to fetch feeds" },
      { status: 500 }
    );
  }
}
