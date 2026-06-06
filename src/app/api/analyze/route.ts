import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { fetchRepoContext, parseRepoUrl } from "@/lib/github";
import { analyzeRepo } from "@/lib/ai";
import { cacheKey, getCached, setCached } from "@/lib/cache";

export const maxDuration = 60;

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
    const key = cacheKey(owner, repo);

    if (!refresh) {
      const cached = getCached(key);
      if (cached) {
        return NextResponse.json({ ...cached, cached: true });
      }
    }

    const session = await auth();
    const githubToken =
      session?.accessToken ?? process.env.GITHUB_TOKEN ?? undefined;

    const ctx = await fetchRepoContext(url, githubToken);
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
    const status = message.includes("Invalid GitHub URL")
      ? 400
      : message.includes("GitHub API error 404")
        ? 404
        : message.includes("GitHub API error 403")
          ? 429
          : 500;

    return NextResponse.json({ error: message }, { status });
  }
}
