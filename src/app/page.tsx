"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { RepoInput } from "@/components/RepoInput";
import { AnalysisResults } from "@/components/AnalysisResults";
import { AuthButton } from "@/components/AuthButton";
import { LoadingProgress } from "@/components/LoadingProgress";
import { AnimatedBackground } from "@/components/AnimatedBackground";
import type { RepoAnalysis } from "@/lib/types";
import { GraduationCap, AlertCircle, RefreshCw } from "lucide-react";

const authEnabled = process.env.NEXT_PUBLIC_AUTH_ENABLED === "true";

interface RepoInfo {
  owner: string;
  name: string;
  url: string;
  description: string | null;
  stars: number;
  forks: number;
  language: string | null;
  topics: string[];
}

interface AnalyzeResponse {
  repo: RepoInfo;
  analysis: RepoAnalysis;
  cached?: boolean;
}

export default function Home() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);
  const [lastUrl, setLastUrl] = useState("");

  const handleAnalyze = async (url: string, refresh = false) => {
    setError(null);
    if (!refresh) setResult(null);
    setLastUrl(url);
    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, refresh }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Something went wrong");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative">
      <AnimatedBackground />
      <div className="hero-glow absolute inset-x-0 top-0 h-96 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-6 py-16">
        <div className="absolute top-6 right-6" data-print-hide>
          <AuthButton />
        </div>

        <header className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 border border-[var(--color-accent)]/20 text-[var(--color-accent-light)] text-sm mb-6">
            <GraduationCap className="w-4 h-4" />
            AI-powered open-source mentor
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            <span className="gradient-text">RepoMentor</span>
          </h1>
          <p className="text-lg text-[var(--color-muted)] mt-4 max-w-xl mx-auto">
            Paste any GitHub repo URL and get a beginner-friendly guide — tech
            stack, setup steps, folder walkthrough, good first issues, and a
            learning path to your first contribution.
          </p>
          {authEnabled && session?.user && (
            <p className="text-sm text-[var(--color-success)] mt-3">
              Signed in as {session.user.name} — higher GitHub API rate limits active
            </p>
          )}
        </header>

        <RepoInput onAnalyze={(url) => handleAnalyze(url)} loading={loading} />

        {error && (
          <div className="mt-8 flex items-center gap-3 max-w-2xl mx-auto bg-[var(--color-danger)]/10 border border-[var(--color-danger)]/30 rounded-xl px-5 py-4 text-[var(--color-danger)]">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <LoadingProgress active={loading} repoUrl={lastUrl} />

        {result && (
          <>
            {result.cached && (
              <div className="mt-8 flex items-center justify-center gap-3" data-print-hide>
                <span className="text-sm text-[var(--color-muted)]">
                  Loaded from cache (24h TTL)
                </span>
                <button
                  onClick={() => handleAnalyze(lastUrl, true)}
                  disabled={loading}
                  className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh analysis
                </button>
              </div>
            )}
            <AnalysisResults
              repo={result.repo}
              analysis={result.analysis}
            />
          </>
        )}

        {!result && !loading && (
          <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            {[
              { title: "Understand", desc: "Project summary & folder-by-folder guide" },
              { title: "Set up", desc: "Detected tech stack & install instructions" },
              { title: "Contribute", desc: "Good first issues, learning path & PR checklist" },
            ].map((f) => (
              <div
                key={f.title}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6"
              >
                <h3 className="font-semibold text-[var(--color-accent-light)]">
                  {f.title}
                </h3>
                <p className="text-sm text-[var(--color-muted)] mt-2">{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
