import type { RepoAnalysis } from "./types";

export interface CachedAnalysis {
  repo: {
    owner: string;
    name: string;
    url: string;
    description: string | null;
    stars: number;
    forks: number;
    language: string | null;
    topics: string[];
  };
  analysis: RepoAnalysis;
}

interface CacheEntry {
  data: CachedAnalysis;
  expiresAt: number;
}

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_ENTRIES = 100;

const globalCache = globalThis as typeof globalThis & {
  __repomentorCache?: Map<string, CacheEntry>;
};

function getStore(): Map<string, CacheEntry> {
  if (!globalCache.__repomentorCache) {
    globalCache.__repomentorCache = new Map();
  }
  return globalCache.__repomentorCache;
}

export function cacheKey(owner: string, repo: string): string {
  return `${owner.toLowerCase()}/${repo.toLowerCase()}`;
}

export function getCached(key: string): CachedAnalysis | null {
  const store = getStore();
  const entry = store.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }

  return entry.data;
}

export function setCached(key: string, data: CachedAnalysis): void {
  const store = getStore();

  if (store.size >= MAX_ENTRIES) {
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }

  store.set(key, {
    data,
    expiresAt: Date.now() + CACHE_TTL_MS,
  });
}

export function clearCached(key: string): void {
  getStore().delete(key);
}
