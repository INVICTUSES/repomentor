import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getToken } from "next-auth/jwt";
import { getAuthSecret } from "@/lib/auth-config";
import { fetchRepoContext, fetchRepoMetadata, parseRepoUrl } from "@/lib/github";
import { analyzeRepo } from "@/lib/ai";
import { getCached, publicCacheKey, setCached, userCacheKey } from "@/lib/cache";

export const maxDuration = 60;

const RATE_LIMIT_WINDOW_MS = 60_000;
const ANONYMOUS_LIMIT = 8;
const AUTHENTICATED_LIMIT = 20;
const REFRESH_LIMIT = 2;

type RateLimitBucket = { count: number; resetAt: number };

const rateLimitGlobal = globalThis as typeof globalThis & {
  __repomentorRateLimit?: Map<string, RateLimitBucket>;
};

function getRateLimitStore(): Map<string, RateLimitBucket> {
  if (!rateLimitGlobal.__repomentorRateLimit) {
    rateLimitGlobal.__repomentorRateLimit = new Map();
  }
  return rateLimitGlobal.__repomentorRateLimit;
}

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwarded ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

function checkRateLimit(key: string, limit: number): boolean {
  const store = getRateLimitStore();
  const now = Date.now();
  const existing = store.get(key);

  if (!existing || now > existing.resetAt) {
    store.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }

  if (existing.count >= limit) return false;
  existing.count += 1;
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url = body?.url;
    const refresh = body?.refresh === true;

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { error: "Please provide a GitHub repository URL" },
        { status: 400 }
      );
    }

    const { owner, repo } = parseRepoUrl(url);
    const session = await auth();
    const jwt = await getToken({ req, secret: getAuthSecret() });
    const githubToken =
      typeof jwt?.accessToken === "string" ? jwt.accessToken : undefined;
    const userId = jwt?.sub ?? session?.user?.email ?? null;
    const requesterKey = userId ? `session:${userId}` : `ip:${getClientIp(req)}`;
    const baseLimit = userId ? AUTHENTICATED_LIMIT : ANONYMOUS_LIMIT;

    if (!checkRateLimit(`analyze:${requesterKey}`, baseLimit)) {
      return NextResponse.json(
        { error: "Too many analysis requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    if (refresh) {
      if (!userId) {
        return NextResponse.json(
          { error: "Sign in before refreshing cached analysis." },
          { status: 401 }
        );
      }
      if (!checkRateLimit(`refresh:${requesterKey}`, REFRESH_LIMIT)) {
        return NextResponse.json(
          { error: "Too many refresh requests. Please wait a minute and try again." },
          { status: 429 }
        );
      }
    }

    const metadata = await fetchRepoMetadata(owner, repo, githubToken);
    if (metadata.isPrivate && !githubToken) {
      return NextResponse.json(
        { error: "Private repositories require GitHub sign-in." },
        { status: 401 }
      );
    }

    const key =
      metadata.isPrivate && userId
        ? userCacheKey(userId, owner, repo)
        : publicCacheKey(owner, repo);

    if (!refresh) {
      const cached = getCached(key);
      if (cached) return NextResponse.json({ ...cached, cached: true });
    }

    const ctx = await fetchRepoContext(url, githubToken);
    if (!githubToken && ctx.isPrivate) {
      return NextResponse.json(
        { error: "Private repositories require GitHub sign-in." },
        { status: 401 }
      );
    }

    const analysis = await analyzeRepo(ctx);

    const result = {
      repo: {
        owner: ctx.owner,
        name: ctx.repo,
        url: ctx.url,
        description: ctx.description,
        stars: ctx.stars,
        forks: ctx.forks,
        language: ctx.language,
        topics: ctx.topics,
      },
      analysis,
      cached: false,
    };

    setCached(key, { repo: result.repo, analysis: result.analysis });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Analysis failed";
    const status = message.includes("Invalid GitHub URL") || message.includes("repository URL")
      ? 400
      : message.includes("not found")
        ? 404
        : message.includes("rate limit")
          ? 429
          : message.includes("access denied")
            ? 403
            : message.includes("AI response")
              ? 502
              : 500;
    const error =
      status === 500
        ? "Analysis failed. Please try again later."
        : message;

    return NextResponse.json({ error }, { status });
  }
}
