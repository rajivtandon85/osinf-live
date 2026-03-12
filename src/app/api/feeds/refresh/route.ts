import { NextRequest, NextResponse } from "next/server";
import { refreshAllFeeds } from "@/lib/feedParser";

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  // Protect the cron endpoint with a shared secret
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await refreshAllFeeds();
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("[api/feeds/refresh]", err);
    return NextResponse.json(
      { success: false, error: "Refresh failed" },
      { status: 500 }
    );
  }
}

// Also allow GET so Vercel Cron can call it directly
export async function GET(req: NextRequest) {
  return POST(req);
}
