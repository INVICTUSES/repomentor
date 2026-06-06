"use client";

import type { RepoAnalysis } from "@/lib/types";
import { downloadMarkdown, printAsPdf } from "@/lib/export";
import { FileDown, Printer } from "lucide-react";

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

export function ExportButtons({
  repo,
  analysis,
}: {
  repo: RepoInfo;
  analysis: RepoAnalysis;
}) {
  return (
    <div className="flex items-center gap-2" data-print-hide>
      <button
        onClick={() => downloadMarkdown(repo, analysis)}
        className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-colors"
      >
        <FileDown className="w-4 h-4" />
        Export Markdown
      </button>
      <button
        onClick={printAsPdf}
        className="flex items-center gap-2 text-sm px-4 py-2 rounded-lg bg-[var(--color-surface)] border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 transition-colors"
      >
        <Printer className="w-4 h-4" />
        Save as PDF
      </button>
    </div>
  );
}
