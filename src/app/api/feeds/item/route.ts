import { NextRequest, NextResponse } from "next/server";
import { getCachedFeeds, refreshAllFeeds } from "@/lib/feedParser";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const id = req.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ success: false, error: "Missing id" }, { status: 400 });
  }

  try {
    let items = await getCachedFeeds();
    if (!items.length) {
      await refreshAllFeeds();
      items = await getCachedFeeds();
    }

    const item = items.find((entry) => entry.id === id);
    if (!item) {
      return NextResponse.json({ success: false, error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: item });
  } catch (err) {
    console.error("[api/feeds/item]", err);
    return NextResponse.json({ success: false, error: "Failed to load item" }, { status: 500 });
  }
}

