"use client";

import type { RepoAnalysis } from "@/lib/types";
import {
  Star,
  GitFork,
  ExternalLink,
  Terminal,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { TechStack } from "./TechStack";
import { FolderGuide } from "./FolderGuide";
import { IssueRecommendations } from "./IssueRecommendations";
import { LearningPath } from "./LearningPath";
import { PRChecklist } from "./PRChecklist";
import { ExportButtons } from "./ExportButtons";

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

interface AnalysisResultsProps {
  repo: RepoInfo;
  analysis: RepoAnalysis;
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 7
      ? "text-[var(--color-success)]"
      : score >= 4
        ? "text-[var(--color-warning)]"
        : "text-[var(--color-danger)]";

  return (
    <div className="flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl px-4 py-2">
      <Sparkles className={`w-4 h-4 ${color}`} />
      <span className="text-sm text-[var(--color-muted)]">Beginner-friendly</span>
      <span className={`font-bold ${color}`}>{score}/10</span>
    </div>
  );
}

export function AnalysisResults({ repo, analysis }: AnalysisResultsProps) {
  return (
    <div className="space-y-10 mt-12">
      <header className="animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <a
              href={repo.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-2xl font-bold hover:text-[var(--color-accent-light)] transition-colors"
            >
              {repo.owner}/{repo.name}
              <ExternalLink className="w-5 h-5 text-[var(--color-muted)]" />
            </a>
            {repo.description && (
              <p className="text-[var(--color-muted)] mt-1">{repo.description}</p>
            )}
            <div className="flex items-center gap-4 mt-3 text-sm text-[var(--color-muted)]">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4" />
                {repo.stars.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="w-4 h-4" />
                {repo.forks.toLocaleString()}
              </span>
              {repo.language && (
                <span className="px-2 py-0.5 rounded-full bg-[var(--color-surface-elevated)]">
                  {repo.language}
                </span>
              )}
            </div>
            {repo.topics.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {repo.topics.map((t) => (
                  <span
                    key={t}
                    className="text-xs px-2.5 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent-light)]"
                  >
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col items-end gap-3">
            <ScoreBadge score={analysis.beginnerFriendlyScore} />
            <ExportButtons repo={repo} analysis={analysis} />
          </div>
        </div>
      </header>

      <section className="animate-fade-in">
        <h2 className="text-xl font-semibold mb-3">Project Summary</h2>
        <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-6 leading-relaxed text-[var(--color-foreground)]/90 whitespace-pre-line">
          {analysis.summary}
        </div>
      </section>

      <TechStack items={analysis.techStack} />

      <section className="animate-fade-in animate-fade-in-delay-1">
        <div className="flex items-center gap-2 mb-4">
          <Terminal className="w-5 h-5 text-[var(--color-accent-light)]" />
          <h2 className="text-xl font-semibold">Setup Instructions</h2>
        </div>
        <ol className="space-y-2">
          {analysis.setupInstructions.map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3"
            >
              <span className="w-6 h-6 rounded-full bg-[var(--color-accent)]/20 text-[var(--color-accent-light)] text-xs font-bold flex items-center justify-center shrink-0">
                {i + 1}
              </span>
              <code className="text-sm font-mono flex-1">{step}</code>
            </li>
          ))}
        </ol>
      </section>

      <FolderGuide folders={analysis.folderGuide} />
      <IssueRecommendations issues={analysis.recommendedIssues} />
      <LearningPath steps={analysis.learningPath} />
      <PRChecklist
        checklist={analysis.prChecklist}
        testSuggestions={analysis.testSuggestions}
      />

      {analysis.contributionTips.length > 0 && (
        <section className="animate-fade-in animate-fade-in-delay-3">
          <div className="flex items-center gap-2 mb-4">
            <MessageCircle className="w-5 h-5 text-[var(--color-accent-light)]" />
            <h2 className="text-xl font-semibold">Contribution Tips</h2>
          </div>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {analysis.contributionTips.map((tip, i) => (
              <li
                key={i}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm"
              >
                {tip}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
