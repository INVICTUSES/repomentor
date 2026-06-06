"use client";

import { useState } from "react";
import { Search, Loader2, Github } from "lucide-react";

interface RepoInputProps {
  onAnalyze: (url: string) => void;
  loading: boolean;
}

export function RepoInput({ onAnalyze, loading }: RepoInputProps) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !loading) onAnalyze(url.trim());
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-[var(--color-accent)] to-[#74b9ff] opacity-20 blur-xl group-focus-within:opacity-40 transition-opacity" />
        <div className="relative flex items-center gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-2 pl-5 focus-within:border-[var(--color-accent)] transition-colors">
          <Github className="w-5 h-5 text-[var(--color-muted)] shrink-0" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://github.com/owner/repository"
            className="flex-1 bg-transparent outline-none text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] text-base py-3"
            disabled={loading}
            required
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-accent)] hover:bg-[var(--color-accent-light)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors shrink-0"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing…
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Analyze
              </>
            )}
          </button>
        </div>
      </div>
      <p className="text-center text-sm text-[var(--color-muted)] mt-4">
        Try{" "}
        <button
          type="button"
          onClick={() => setUrl("https://github.com/facebook/react")}
          className="text-[var(--color-accent-light)] hover:underline"
        >
          facebook/react
        </button>
        {" · "}
        <button
          type="button"
          onClick={() => setUrl("https://github.com/vercel/next.js")}
          className="text-[var(--color-accent-light)] hover:underline"
        >
          vercel/next.js
        </button>
        {" · "}
        <button
          type="button"
          onClick={() => setUrl("https://github.com/fastapi/fastapi")}
          className="text-[var(--color-accent-light)] hover:underline"
        >
          fastapi/fastapi
        </button>
      </p>
    </form>
  );
}
