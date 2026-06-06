"use client";

import { useEffect, useState } from "react";
import {
  Github,
  FileSearch,
  FolderTree,
  Cpu,
  Target,
  Sparkles,
  Map,
  CheckCircle2,
  Loader2,
  Circle,
} from "lucide-react";

const STEPS = [
  {
    id: "connect",
    label: "Connecting to GitHub repository",
    detail: "Validating URL and reaching the GitHub API",
    icon: Github,
    duration: 2500,
  },
  {
    id: "metadata",
    label: "Fetching repository metadata",
    detail: "Reading README, stars, topics, and description",
    icon: FileSearch,
    duration: 3500,
  },
  {
    id: "scrape",
    label: "Scanning repository structure",
    detail: "Mapping folders, config files, and project layout",
    icon: FolderTree,
    duration: 4000,
  },
  {
    id: "tech",
    label: "Detecting tech stack",
    detail: "Analyzing package.json, manifests, and file types",
    icon: Cpu,
    duration: 3500,
  },
  {
    id: "issues",
    label: "Reviewing open issues",
    detail: "Finding good first issues and difficulty signals",
    icon: Target,
    duration: 4000,
  },
  {
    id: "ai",
    label: "Generating AI mentor guide",
    detail: "Writing setup steps, folder guide, and summaries",
    icon: Sparkles,
    duration: 6000,
  },
  {
    id: "path",
    label: "Building your learning path",
    detail: "Creating contribution tips, PR checklist, and next steps",
    icon: Map,
    duration: 4500,
  },
];

interface LoadingProgressProps {
  active: boolean;
  repoUrl?: string;
}

export function LoadingProgress({ active, repoUrl }: LoadingProgressProps) {
  if (!active) return null;

  return <ActiveLoadingProgress repoUrl={repoUrl} />;
}

function ActiveLoadingProgress({ repoUrl }: { repoUrl?: string }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(
    () => new Set()
  );
  const [progress, setProgress] = useState(2);

  useEffect(() => {
    let stepIndex = 0;
    let elapsed = 0;
    const tickMs = 100;

    const interval = setInterval(() => {
      elapsed += tickMs;
      const step = STEPS[stepIndex];
      const stepProgress = Math.min(elapsed / step.duration, 1);
      const baseProgress = (stepIndex / STEPS.length) * 100;
      const stepContribution = (stepProgress / STEPS.length) * 100;
      setProgress(Math.min(baseProgress + stepContribution, 95));

      if (stepProgress >= 1 && stepIndex < STEPS.length - 1) {
        setCompletedSteps((prev) => new Set([...prev, stepIndex]));
        stepIndex += 1;
        setCurrentStep(stepIndex);
        elapsed = 0;
      }
    }, tickMs);

    return () => clearInterval(interval);
  }, []);

  const repoName = repoUrl
    ? repoUrl.replace(/\/$/, "").split("/").slice(-2).join("/")
    : "repository";

  return (
    <div className="mt-12 max-w-xl mx-auto animate-fade-in">
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 sm:p-8 shadow-lg shadow-[var(--color-accent)]/5">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-[var(--color-accent-light)]">
              Analyzing {repoName}
            </p>
            <span className="text-xs font-mono text-[var(--color-muted)]">
              {Math.round(progress)}%
            </span>
          </div>
          <div className="h-2 bg-[var(--color-surface-elevated)] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--color-accent)] to-[#74b9ff] transition-all duration-300 ease-out relative"
              style={{ width: `${progress}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-shimmer" />
            </div>
          </div>
        </div>

        <ul className="space-y-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon;
            const isComplete = completedSteps.has(index);
            const isCurrent = currentStep === index && !isComplete;
            const isPending = index > currentStep && !isComplete;

            return (
              <li
                key={step.id}
                className={`flex items-start gap-3 transition-all duration-500 ${
                  isPending ? "opacity-40" : "opacity-100"
                } ${isCurrent ? "scale-[1.02]" : "scale-100"}`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all duration-500 ${
                    isComplete
                      ? "bg-[var(--color-success)]/20 text-[var(--color-success)]"
                      : isCurrent
                        ? "bg-[var(--color-accent)]/20 text-[var(--color-accent-light)] ring-2 ring-[var(--color-accent)]/40"
                        : "bg-[var(--color-surface-elevated)] text-[var(--color-muted)]"
                  }`}
                >
                  {isComplete ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Circle className="w-3 h-3" />
                  )}
                </div>

                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="flex items-center gap-2">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isCurrent
                          ? "text-[var(--color-accent-light)]"
                          : "text-[var(--color-muted)]"
                      }`}
                    />
                    <p
                      className={`text-sm font-medium ${
                        isCurrent
                          ? "text-[var(--color-foreground)]"
                          : isComplete
                            ? "text-[var(--color-muted)] line-through decoration-[var(--color-success)]/50"
                            : "text-[var(--color-muted)]"
                      }`}
                    >
                      {step.label}
                    </p>
                  </div>
                  {isCurrent && (
                    <p className="text-xs text-[var(--color-muted)] mt-1 animate-fade-in">
                      {step.detail}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <p className="text-center text-xs text-[var(--color-muted)]/70 mt-6">
          Hang tight — we&apos;re building your personalized mentor guide
        </p>
      </div>
    </div>
  );
}
