import type { IssueRecommendation } from "@/lib/types";
import { Target, ExternalLink, Clock } from "lucide-react";

const DIFFICULTY_STYLES = {
  beginner: "difficulty-beginner bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/30",
  intermediate: "difficulty-intermediate bg-[var(--color-warning)]/15 text-[var(--color-warning)] border-[var(--color-warning)]/30",
  advanced: "difficulty-advanced bg-[var(--color-danger)]/15 text-[var(--color-danger)] border-[var(--color-danger)]/30",
};

interface IssueRecommendationsProps {
  issues: IssueRecommendation[];
  repoOwner: string;
  repoName: string;
}

function issueHref(repoOwner: string, repoName: string, issueNumber: number): string {
  return `https://github.com/${repoOwner}/${repoName}/issues/${issueNumber}`;
}

export function IssueRecommendations({
  issues,
  repoOwner,
  repoName,
}: IssueRecommendationsProps) {
  if (!issues.length) {
    return (
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-[var(--color-accent-light)]" />
          <h2 className="text-xl font-semibold">Good First Issues</h2>
        </div>
        <p className="text-[var(--color-muted)]">
          No open issues found. Check the repo&apos;s discussions or consider a docs/README improvement.
        </p>
      </section>
    );
  }

  return (
    <section className="animate-fade-in animate-fade-in-delay-2">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-[var(--color-accent-light)]" />
        <h2 className="text-xl font-semibold">Good First Issues</h2>
      </div>
      <div className="space-y-4">
        {issues.map((issue) => (
          <a
            key={issue.issueNumber}
            href={issueHref(repoOwner, repoName, issue.issueNumber)}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 hover:border-[var(--color-accent)]/50 transition-colors group"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-mono text-[var(--color-muted)]">
                    #{issue.issueNumber}
                  </span>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border capitalize ${DIFFICULTY_STYLES[issue.difficulty]}`}
                  >
                    {issue.difficulty}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-[var(--color-muted)]">
                    <Clock className="w-3 h-3" />
                    {issue.estimatedHours}
                  </span>
                </div>
                <h3 className="font-medium mt-1 group-hover:text-[var(--color-accent-light)] transition-colors">
                  {issue.title}
                </h3>
              </div>
              <ExternalLink className="w-4 h-4 text-[var(--color-muted)] shrink-0" />
            </div>
            <p className="text-sm text-[var(--color-muted)] mt-2">{issue.whyGoodFirst}</p>
            <p className="text-sm mt-1">
              <span className="text-[var(--color-muted)]">Why this difficulty: </span>
              {issue.difficultyReason}
            </p>
            {issue.skillsNeeded.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {issue.skillsNeeded.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2 py-1 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent-light)]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}
          </a>
        ))}
      </div>
    </section>
  );
}
