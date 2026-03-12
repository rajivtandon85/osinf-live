import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import crypto from "crypto";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

const ARTICLE_CACHE_TTL = 60 * 60; // 1 hour

function cacheKey(url: string): string {
  const hash = crypto.createHash("sha1").update(url).digest("hex").slice(0, 20);
  return `osinf:article:${hash}`;
}

function absolutifyImages(html: string, baseUrl: string): string {
  try {
    const base = new URL(baseUrl);
    return html.replace(
      /(<img[^>]+src=["'])(?!https?:\/\/|data:)([^"']+)(["'])/gi,
      (_, prefix, src, suffix) => {
        try {
          const abs = new URL(src, base).href;
          return `${prefix}${abs}${suffix}`;
        } catch {
          return `${prefix}${src}${suffix}`;
        }
      }
    );
  } catch {
    return html;
  }
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json(
      { success: false, error: "Missing url parameter" },
      { status: 400 }
    );
  }

  try {
    // Check cache first
    const key = cacheKey(url);
    const cached = await redis.get(key);
    if (cached) {
      const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
      return NextResponse.json({ success: true, data: parsed });
    }

    // Fetch the page with a browser-like User-Agent
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(10_000),
    });

    if (!response.ok) {
      return NextResponse.json(
        { success: false, error: `Fetch failed: ${response.status}` },
        { status: 502 }
      );
    }

    const html = await response.text();

    // Parse with JSDOM + Readability
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const article = reader.parse();

    if (!article || !article.content || article.content.length < 100) {
      return NextResponse.json(
        { success: false, error: "Could not extract article content" },
        { status: 422 }
      );
    }

    const data = {
      title: article.title || "",
      content: absolutifyImages(article.content, url),
      byline: article.byline || "",
      siteName: article.siteName || "",
      excerpt: article.excerpt || "",
      length: article.length || 0,
    };

    // Cache the result
    await redis.set(key, JSON.stringify(data), { ex: ARTICLE_CACHE_TTL });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[api/read]", (err as Error).message);
    return NextResponse.json(
      { success: false, error: "Extraction failed" },
      { status: 500 }
    );
  }
}
