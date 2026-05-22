import { NextRequest, NextResponse } from "next/server";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
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

  if (status === 403 || status === 429) {
    return strongTitleSignal || strongBodySignal;
  }

  // For HTTP 200, require both a challenge-like title and a strong body marker.
  return strongTitleSignal && strongBodySignal;
}

function sanitizeText(text: string): string {
  return text.replace(/\s+/g, " ").trim();
}

function buildParagraphHtml(text: string): string {
  const lines = sanitizeText(text)
    .split(/\n{2,}|\.(?=\s+[A-Z])/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (!lines.length) return "";
  return lines.map((line) => `<p>${line}.</p>`).join("\n");
}

function extractJsonLdArticle(document: Document): { content?: string; byline?: string } {
  const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));

  for (const script of scripts) {
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
        const type = entry?.["@type"];
        const types = Array.isArray(type) ? type : [type];
        if (!types.some((t) => typeof t === "string" && /article|newsarticle|reportage/i.test(t))) {
          continue;
        }

        const articleBody = typeof entry?.articleBody === "string" ? entry.articleBody : "";
        const byline =
          typeof entry?.author?.name === "string"
            ? entry.author.name
            : Array.isArray(entry?.author)
              ? entry.author.map((a: { name?: string }) => a?.name).filter(Boolean).join(", ")
              : "";

        if (articleBody.length >= MIN_CONTENT_LENGTH) {
          return { content: buildParagraphHtml(articleBody), byline };
        }
      }
    } catch {
      continue;
    }
  }

  return {};
}

function extractFromDom(document: Document): string {
  const selectors = [
    "article",
    "main article",
    "[itemprop='articleBody']",
    ".story__content",
    ".article-body",
    ".entry-content",
  ];

  for (const selector of selectors) {
    const node = document.querySelector(selector);
    if (!node) continue;
    const paragraphs = Array.from(node.querySelectorAll("p"))
      .map((p) => sanitizeText(p.textContent || ""))
      .filter((p) => p.length > 0);
    const joined = paragraphs.join("\n\n");
    if (joined.length >= MIN_CONTENT_LENGTH) {
      return paragraphs.map((p) => `<p>${p}</p>`).join("\n");
    }
  }

  return "";
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
      const maybeHtml = await response.text().catch(() => "");
      if ((response.status === 403 || response.status === 429) && hasChallengeSignals(maybeHtml, response.status)) {
        return NextResponse.json(
          { success: false, error: "Source blocked extraction", code: "SOURCE_BLOCKED" },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { success: false, error: `Fetch failed: ${response.status}`, code: "FETCH_FAILED" },
        { status: 502 }
      );
    }

    const html = await response.text();

    if (hasChallengeSignals(html, response.status)) {
      return NextResponse.json(
        { success: false, error: "Source blocked extraction", code: "SOURCE_BLOCKED" },
        { status: 403 }
      );
    }

    // Parse with JSDOM + Readability
    let dom: JSDOM;
    let article: ReturnType<Readability["parse"]>;
    try {
      dom = new JSDOM(html, { url });
      const reader = new Readability(dom.window.document, {
        keepClasses: false,
      });
      article = reader.parse();
    } catch (err) {
      console.error("[api/read] dom/readability failure:", (err as Error).message);
      return NextResponse.json(
        { success: false, error: "Could not parse source document", code: "PARSER_FAILED" },
        { status: 422 }
      );
    }

    let content = article?.content || "";
    let byline = article?.byline || "";
    let method = "readability";

    if (!content || content.length < MIN_CONTENT_LENGTH) {
      const jsonLd = extractJsonLdArticle(dom.window.document);
      if (jsonLd.content && jsonLd.content.length >= MIN_CONTENT_LENGTH) {
        content = jsonLd.content;
        byline = byline || jsonLd.byline || "";
        method = "jsonld";
      }
    }

    if (!content || content.length < MIN_CONTENT_LENGTH) {
      const domContent = extractFromDom(dom.window.document);
      if (domContent && domContent.length >= MIN_CONTENT_LENGTH) {
        content = domContent;
        method = "dom";
      }
    }

    if (!content || content.length < MIN_CONTENT_LENGTH) {
      return NextResponse.json(
        { success: false, error: "Could not extract article content", code: "EXTRACTION_EMPTY" },
        { status: 422 }
      );
    }

    const data = {
      title: article?.title || "",
      content: absolutifyImages(content, url),
      byline,
      siteName: article?.siteName || "",
      excerpt: article?.excerpt || "",
      length: article?.length || content.length,
      method,
    };

    // Cache the result
    await redis.set(key, JSON.stringify(data), { ex: ARTICLE_CACHE_TTL });

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[api/read] unhandled:", (err as Error).message);
    return NextResponse.json(
      { success: false, error: "Extraction failed", code: "UNHANDLED" },
      { status: 500 }
    );
  }
}
