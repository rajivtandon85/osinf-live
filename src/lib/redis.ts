import { Redis } from "@upstash/redis";

// In development without Redis credentials, fall back to an in-memory store
class MemoryStore {
  private store = new Map<string, { value: string; expiresAt?: number }>();

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async set(key: string, value: string, opts?: { ex?: number }): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: opts?.ex ? Date.now() + opts.ex * 1000 : undefined,
    });
  }
}

function createRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    return new Redis({ url, token });
  }

  console.warn(
    "[redis] Upstash credentials not found — using in-memory store (dev only)"
  );
  return new MemoryStore() as unknown as Redis;
}

export const redis = createRedisClient();

export const CACHE_KEYS = {
  allFeeds: "osinf:feeds:all",
  feedsByCategory: (cat: string) => `osinf:feeds:cat:${cat}`,
  alerts: "osinf:alerts:keywords",
  alertMatches: "osinf:alerts:matches",
  lastRefreshed: "osinf:meta:last_refreshed",
};

export const CACHE_TTL_SECONDS = 30 * 60; // 30 minutes
