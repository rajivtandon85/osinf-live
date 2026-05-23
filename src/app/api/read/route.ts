import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { redis } from "@/lib/redis";

export const dynamic = "force-dynamic";

const ARTICLE_CACHE_TTL = 60 * 60; // 1 hour
const MIN_CONTENT_LENGTH = 100;

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

function hasChallengeSignals(html: string, status?: number): boolean {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
  const title = (titleMatch?.[1] || "").toLowerCase();
  const body = html.toLowerCase();

  const strongTitleSignal =
    title.includes("just a moment") ||
    title.includes("attention required") ||
    title.includes("verify you are human") ||
    title.includes("access denied");

  const strongBodySignal =
    body.includes("cf-challenge") ||
    body.includes("g-recaptcha") ||
    body.includes("hcaptcha") ||
    body.includes("/cdn-cgi/challenge") ||
    body.includes("why do i have to complete a captcha") ||
    body.includes("please enable javascript and cookies to continue");

  if (status === 403 || status === 429) return strongTitleSignal || strongBodySignal;
  return strongTitleSignal && strongBodySignal;
}

function sanitizeText(text: string): string {
  return text.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

function buildParagraphHtml(text: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "";
  const parts = clean.split(/\.(?=\s+[A-Z])/).map((p) => p.trim()).filter(Boolean);
  return (parts.length ? parts : [clean]).map((line) => `<p>${line}${line.endsWith(".") ? "" : "."}</p>`).join("\n");
}

function extractBasicFromHtml(html: string): { title: string; content: string; excerpt: string } {
  const title = (html.match(/<title[^>]*>(.*?)<\/title>/i)?.[1] || "").trim();

  // Prefer article/main body chunks first.
  const articleChunk =
    html.match(/<article[\s\S]*?<\/article>/i)?.[0] ||
    html.match(/<main[\s\S]*?<\/main>/i)?.[0] ||
    "";

  const paragraphMatches = Array.from((articleChunk || html).matchAll(/<p[^>]*>([\s\S]*?)<\/p>/gi));
  const paragraphs = paragraphMatches
    .map((m) => sanitizeText(m[1] || ""))
    .filter((p) => p.length > 30)
    .slice(0, 80);

  const joined = paragraphs.join("\n\n");
  const content = paragraphs.map((p) => `<p>${p}</p>`).join("\n");

  const description =
    html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)?.[1] ||
    "";

  return {
    title,
    content: joined.length >= MIN_CONTENT_LENGTH ? content : buildParagraphHtml(description),
    excerpt: description,
  };
}

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ success: false, error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const key = cacheKey(url);

    try {
      const cached = await redis.get(key);
      if (cached) {
        const parsed = typeof cached === "string" ? JSON.parse(cached) : cached;
        return NextResponse.json({ success: true, data: parsed });
      }
    } catch (err) {
      console.error("[api/read] cache read failed:", (err as Error).message);
    }

    let response: Response;
    try {
      response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9",
        },
        signal: AbortSignal.timeout(10_000),
      });
    } catch (err) {
      return NextResponse.json(
        {
          success: false,
          error: "Network fetch failed",
          code: "FETCH_THREW",
          stage: "fetch",
          detail: (err as Error).message,
        },
        { status: 502 }
      );
    }

    if (!response.ok) {
      const maybeHtml = await response.text().catch(() => "");
      if ((response.status === 403 || response.status === 429) && hasChallengeSignals(maybeHtml, response.status)) {
        return NextResponse.json(
          { success: false, error: "Source blocked extraction", code: "SOURCE_BLOCKED", stage: "fetch" },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Fetch failed: ${response.status}`, code: "FETCH_FAILED", stage: "fetch" },
        { status: 502 }
      );
    }

    const html = await response.text();

    if (hasChallengeSignals(html, response.status)) {
      return NextResponse.json(
        { success: false, error: "Source blocked extraction", code: "SOURCE_BLOCKED", stage: "fetch" },
        { status: 403 }
      );
    }

    let title = "";
    let content = "";
    let byline = "";
    let siteName = "";
    let excerpt = "";
    let method = "basic";

    // Try readability stack first, but never crash if unavailable.
    try {
      const [{ JSDOM }, { Readability }] = await Promise.all([
        import("jsdom"),
        import("@mozilla/readability"),
      ]);

      const dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document, { keepClasses: false });
      const article = reader.parse();

      title = article?.title || "";
      content = article?.content || "";
      byline = article?.byline || "";
      siteName = article?.siteName || "";
      excerpt = article?.excerpt || "";
      method = "readability";

      if (!content || content.length < MIN_CONTENT_LENGTH) {
        const jsonLdScripts = Array.from(dom.window.document.querySelectorAll('script[type="application/ld+json"]'));
        for (const script of jsonLdScripts) {
          const raw = script.textContent?.trim();
          if (!raw) continue;
          try {
            const parsed = JSON.parse(raw);
            const entries = Array.isArray(parsed)
              ? parsed
              : Array.isArray(parsed?.["@graph"])
                ? parsed["@graph"]
                : [parsed];
            for (const entry of entries) {
              const t = entry?.["@type"];
              const types = Array.isArray(t) ? t : [t];
              if (!types.some((x) => typeof x === "string" && /article|newsarticle|reportage/i.test(x))) continue;
              const body = typeof entry?.articleBody === "string" ? entry.articleBody : "";
              if (body.length >= MIN_CONTENT_LENGTH) {
                content = buildParagraphHtml(body);
                const author = entry?.author;
                byline = byline ||
                  (typeof author?.name === "string"
                    ? author.name
                    : Array.isArray(author)
                      ? author.map((a: { name?: string }) => a?.name).filter(Boolean).join(", ")
                      : "");
                method = "jsonld";
                break;
              }
            }
            if (content.length >= MIN_CONTENT_LENGTH) break;
          } catch {
            continue;
          }
        }
      }

      if (!content || content.length < MIN_CONTENT_LENGTH) {
        const basic = extractBasicFromHtml(html);
        content = basic.content;
        title = title || basic.title;
        excerpt = excerpt || basic.excerpt;
        method = "basic";
      }
    } catch (err) {
      console.error("[api/read] readability import/parse failed:", (err as Error).message);
      const basic = extractBasicFromHtml(html);
      title = basic.title;
      content = basic.content;
      excerpt = basic.excerpt;
      method = "basic";
    }

    if (!content || content.length < 20) {
      return NextResponse.json(
        { success: false, error: "Could not extract article content", code: "EXTRACTION_EMPTY", stage: "extract" },
        { status: 422 }
      );
    }

    const data = {
      title,
      content: absolutifyImages(content, url),
      byline,
      siteName,
      excerpt,
      length: content.length,
      method,
    };

    try {
      await redis.set(key, JSON.stringify(data), { ex: ARTICLE_CACHE_TTL });
    } catch (err) {
      console.error("[api/read] cache write failed:", (err as Error).message);
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[api/read] unhandled:", (err as Error).message);
    return NextResponse.json(
      {
        success: false,
        error: "Extraction failed",
        code: "UNHANDLED",
        stage: "unknown",
        detail: (err as Error).message,
      },
      { status: 422 }
    );
  }
}
