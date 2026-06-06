type RateLimitBucket = { count: number; resetAt: number };

interface RateLimitOptions {
  key: string;
  limit: number;
  windowSeconds: number;
}

const rateLimitGlobal = globalThis as typeof globalThis & {
  __repomentorRateLimit?: Map<string, RateLimitBucket>;
};

function getMemoryStore(): Map<string, RateLimitBucket> {
  if (!rateLimitGlobal.__repomentorRateLimit) {
    rateLimitGlobal.__repomentorRateLimit = new Map();
  }
  return rateLimitGlobal.__repomentorRateLimit;
}

async function upstashCommand<T>(command: unknown[]): Promise<T> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    throw new Error("Rate limiter is not configured");
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    throw new Error("Rate limiter is unavailable");
  }

  const data = (await response.json()) as { result: T };
  return data.result;
}

async function checkRedisLimit({
  key,
  limit,
  windowSeconds,
}: RateLimitOptions): Promise<boolean> {
  const count = Number(await upstashCommand<number>(["INCR", key]));
  if (count === 1) {
    await upstashCommand<"OK">(["EXPIRE", key, windowSeconds]);
  }
  return count <= limit;
}

function checkMemoryLimit({
  key,
  limit,
  windowSeconds,
}: RateLimitOptions): boolean {
  const store = getMemoryStore();
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowSeconds * 1000 });
    return true;
  }

  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}

export async function checkRateLimit(options: RateLimitOptions): Promise<boolean> {
  const hasRedisConfig = Boolean(
    process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
  );

  if (hasRedisConfig) {
    return checkRedisLimit(options);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Rate limiter is not configured");
  }

  return checkMemoryLimit(options);
}
