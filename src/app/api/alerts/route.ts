import { NextRequest, NextResponse } from "next/server";
import { redis, CACHE_KEYS } from "@/lib/redis";
import { AlertKeyword } from "@/types/feed";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// GET /api/alerts — return keywords + recent matches
export async function GET() {
  const [keywordsRaw, matchesRaw] = await Promise.all([
    redis.get(CACHE_KEYS.alerts),
    redis.get(CACHE_KEYS.alertMatches),
  ]);

  const keywords: AlertKeyword[] = keywordsRaw
    ? JSON.parse(keywordsRaw as string)
    : [];
  const matches = matchesRaw ? JSON.parse(matchesRaw as string) : [];

  return NextResponse.json({ success: true, data: { keywords, matches } });
}

// POST /api/alerts — add a new keyword
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { keyword, categories } = body as {
    keyword: string;
    categories?: string[];
  };

  if (!keyword?.trim()) {
    return NextResponse.json(
      { success: false, error: "keyword is required" },
      { status: 400 }
    );
  }

  const raw = await redis.get(CACHE_KEYS.alerts);
  const keywords: AlertKeyword[] = raw ? JSON.parse(raw as string) : [];

  const newKeyword: AlertKeyword = {
    id: crypto.randomUUID(),
    keyword: keyword.trim().toLowerCase(),
    categories: categories as AlertKeyword["categories"],
    createdAt: new Date().toISOString(),
  };

  const updated = [newKeyword, ...keywords];
  await redis.set(CACHE_KEYS.alerts, JSON.stringify(updated));

  return NextResponse.json({ success: true, data: newKeyword }, { status: 201 });
}

// DELETE /api/alerts?id=xxx — remove a keyword
export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get("id");
  if (!id) {
    return NextResponse.json(
      { success: false, error: "id is required" },
      { status: 400 }
    );
  }

  const raw = await redis.get(CACHE_KEYS.alerts);
  const keywords: AlertKeyword[] = raw ? JSON.parse(raw as string) : [];
  const updated = keywords.filter((k) => k.id !== id);
  await redis.set(CACHE_KEYS.alerts, JSON.stringify(updated));

  return NextResponse.json({ success: true });
}
