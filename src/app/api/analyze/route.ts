import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchRepoContext, fetchRepoMetadata, parseRepoUrl } from "@/lib/github";
import { analyzeRepo } from "@/lib/ai";
import { getCached, publicCacheKey, setCached } from "@/lib/cache";
import { checkRateLimit } from "@/lib/rate-limit";

export const maxDuration = 60;

const RATE_LIMIT_WINDOW_MS = 60_000;
const ANONYMOUS_LIMIT = 8;
const AUTHENTICATED_LIMIT = 20;
const REFRESH_LIMIT = 2;
const MAX_BODY_BYTES = 4096;

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (
    forwarded ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export async function POST(req: NextRequest) {
  try {
    const contentLength = Number(req.headers.get("content-length") ?? "0");
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request body is too large." },
        { status: 413 }
      );
    }

    const ipKey = `ip:${getClientIp(req)}`;
    const preflightAllowed = await checkRateLimit({
      key: `analyze:preflight:${ipKey}`,
      limit: ANONYMOUS_LIMIT,
      windowSeconds: RATE_LIMIT_WINDOW_MS / 1000,
    });

    if (!preflightAllowed) {
      return NextResponse.json(
        { error: "Too many analysis requests. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    const rawBody = await req.text();
    if (rawBody.length > MAX_BODY_BYTES) {
      return NextResponse.json(
        { error: "Request body is too large." },
        { status: 413 }
      );
    }

    let body: { url?: unknown; refresh?: unknown };
    try {
      body = JSON.parse(rawBody) as { url?: unknown; refresh?: unknown };
    } catch {
      return NextResponse.json(
        { error: "Request body must be valid JSON." },
        { status: 400 }
      );
    }
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
    const userId = session?.user?.email ?? null;
    const requesterKey = userId ? `session:${userId}` : ipKey;
    const baseLimit = userId ? AUTHENTICATED_LIMIT : ANONYMOUS_LIMIT;

    const allowed = await checkRateLimit({
      key: `analyze:${requesterKey}`,
      limit: baseLimit,
      windowSeconds: RATE_LIMIT_WINDOW_MS / 1000,
    });

    if (!allowed) {
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
      const refreshAllowed = await checkRateLimit({
        key: `refresh:${requesterKey}`,
        limit: REFRESH_LIMIT,
        windowSeconds: RATE_LIMIT_WINDOW_MS / 1000,
      });
      if (!refreshAllowed) {
        return NextResponse.json(
          { error: "Too many refresh requests. Please wait a minute and try again." },
          { status: 429 }
        );
      }
    }

    const metadata = await fetchRepoMetadata(owner, repo);
    if (metadata.isPrivate) {
      return NextResponse.json(
        { error: "RepoMentor currently analyzes public repositories only." },
        { status: 403 }
      );
    }

    const key = publicCacheKey(owner, repo);

    if (!refresh) {
      const cached = getCached(key);
      if (cached) return NextResponse.json({ ...cached, cached: true });
    }

    const ctx = await fetchRepoContext(url);
    if (ctx.isPrivate) {
      return NextResponse.json(
        { error: "RepoMentor currently analyzes public repositories only." },
        { status: 403 }
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
        : message.includes("Rate limiter")
          ? 503
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
