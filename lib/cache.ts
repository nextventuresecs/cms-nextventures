/**
 * Serverless-compatible Caching Layer for Next.js on Vercel
 * Supports Upstash Redis / Memory cache fallback for high-throughput public endpoints
 */

type CacheEntry<T> = {
  data: T;
  expiry: number;
};

const memoryStore = new Map<string, CacheEntry<any>>();

export async function cacheGet<T>(key: string): Promise<T | null> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  // Try Upstash Redis if configured
  if (upstashUrl && upstashToken) {
    try {
      const res = await fetch(`${upstashUrl}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const json = await res.json();
        if (json.result) {
          return typeof json.result === 'string' ? JSON.parse(json.result) : json.result;
        }
      }
    } catch (err) {
      console.warn('Redis GET failed, falling back to memory store:', err);
    }
  }

  // Memory fallback
  const item = memoryStore.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    memoryStore.delete(key);
    return null;
  }
  return item.data as T;
}

export async function cacheSet<T>(key: string, data: T, ttlSeconds: number = 300): Promise<void> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      await fetch(`${upstashUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(data))}?EX=${ttlSeconds}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: 'no-store',
      });
      return;
    } catch (err) {
      console.warn('Redis SET failed, using memory store:', err);
    }
  }

  // Memory fallback
  memoryStore.set(key, {
    data,
    expiry: Date.now() + ttlSeconds * 1000,
  });
}

export async function cacheInvalidate(keyOrPrefix: string): Promise<void> {
  const upstashUrl = process.env.UPSTASH_REDIS_REST_URL;
  const upstashToken = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (upstashUrl && upstashToken) {
    try {
      await fetch(`${upstashUrl}/del/${encodeURIComponent(keyOrPrefix)}`, {
        headers: { Authorization: `Bearer ${upstashToken}` },
        cache: 'no-store',
      });
    } catch (err) {
      console.warn('Redis DEL failed:', err);
    }
  }

  // Memory fallback invalidation
  for (const k of memoryStore.keys()) {
    if (k.startsWith(keyOrPrefix)) {
      memoryStore.delete(k);
    }
  }
}
