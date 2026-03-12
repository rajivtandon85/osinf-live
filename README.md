# OSINF Live

Personal Open Source Intelligence (OSINF) news aggregator. Pulls RSS/Atom feeds from 40+ international news sources, categorised by editorial alignment (West vs Neutral) and domain (Geopolitical, Cyber, Maritime, Aviation, Environmental, Dark Web / Threat Intel).

Live at **[osinf.live](https://osinf.live)**

## Features

- **West / Neutral alignment tabs** — sources classified by editorial stance, not geography
- **Category filtering** — News, Cyber, Maritime, Aviation, Environmental, Dark Web
- **Full-text search** — keyword search across article titles, summaries, tags, and source names
- **Keyword alerts** — set up alert keywords and get matches highlighted across all feeds
- **In-app article reader** — extracts and renders article content using Mozilla Readability; auto-falls back to opening in a new tab if extraction fails
- **Non-English filtering** — automatically filters out non-English articles from multilingual feeds
- **Scheduled refresh** — Vercel Cron fetches fresh feeds every 15 minutes
- **Redis caching** — Upstash Redis caches feeds (30 min TTL) and extracted articles (1 hour TTL)

## Tech Stack

- **Framework**: Next.js 16 (App Router), TypeScript
- **Styling**: Tailwind CSS 4
- **Feed parsing**: rss-parser
- **Article extraction**: @mozilla/readability + jsdom
- **Cache**: Upstash Redis (with in-memory fallback for local dev)
- **Hosting**: Vercel

## Sources

40+ feeds across both tabs:

| Tab | Regions covered |
|---|---|
| **West** | Reuters, BBC, AP, CNN, Guardian, France24, DW, The Hindu, NDTV, Scroll.in, Japan Times, Kyodo, Daily Star BD + all domain feeds (Cyber, Maritime, Aviation, Environmental, Dark Web) |
| **Neutral** | Al Jazeera, Middle East Eye, Press TV, TRT World, Dawn, Express Tribune, SCMP, Global Times, CNA, RT, TASS, Meduza, UNIAN, Sahara Reporters, Daily Maverick, The Grayzone, Consortium News, Responsible Statecraft, OSINT News + more |

## Setup

### Prerequisites

- Node.js 20+
- An Upstash Redis database (free tier works)

### Local development

```bash
# Clone
git clone https://github.com/<your-username>/osinf-live.git
cd osinf-live

# Install dependencies
npm install

# Configure environment
cp .env.example .env.local
# Edit .env.local with your Upstash credentials
# (optional — app falls back to in-memory cache without Redis)

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment variables

| Variable | Required | Description |
|---|---|---|
| `UPSTASH_REDIS_REST_URL` | For production | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | For production | Upstash Redis REST token |
| `CRON_SECRET` | For production | Secret to protect the feed refresh endpoint |

## Deploy to Vercel

1. Push this repo to GitHub
2. Import in [Vercel](https://vercel.com/new)
3. Add environment variables (Upstash Redis URL + token, cron secret)
4. Deploy — Vercel will auto-detect Next.js and configure everything
5. The `vercel.json` cron job will refresh feeds every 15 minutes

### Custom domain

In Vercel dashboard: Settings > Domains > Add `osinf.live` and configure DNS.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── alerts/route.ts      # Keyword alerts CRUD
│   │   ├── feeds/
│   │   │   ├── route.ts         # Feed items API (filter, search, paginate)
│   │   │   └── refresh/route.ts # Cron-triggered feed refresh
│   │   └── read/route.ts        # Article content extraction
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                  # Main dashboard
├── components/
│   ├── AlertsPanel.tsx
│   ├── AlignmentTabs.tsx
│   ├── ArticleReader.tsx         # In-app reader modal
│   ├── CategoryFilter.tsx
│   ├── FeedCard.tsx
│   ├── FeedTimeline.tsx
│   ├── Header.tsx
│   └── SearchBar.tsx
├── lib/
│   ├── feedParser.ts             # RSS fetch, parse, normalize, cache
│   ├── redis.ts                  # Upstash client + in-memory fallback
│   └── sources.ts                # All feed source definitions
└── types/
    └── feed.ts                   # TypeScript interfaces
```

## License

Private project.
