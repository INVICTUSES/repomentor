import type { LearningStep } from "@/lib/types";
import { Map, BookOpen } from "lucide-react";

export function LearningPath({ steps }: { steps: LearningStep[] }) {
  return (
    <section className="animate-fade-in animate-fade-in-delay-3">
      <div className="flex items-center gap-2 mb-4">
        <Map className="w-5 h-5 text-[var(--color-accent-light)]" />
        <h2 className="text-xl font-semibold">Learning Path</h2>
      </div>
      <div className="relative">
        <div className="absolute left-[19px] top-8 bottom-8 w-px bg-[var(--color-border)]" />
        <div className="space-y-6">
          {steps.map((step) => (
            <div key={step.step} className="relative flex gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--color-accent)]/20 border-2 border-[var(--color-accent)] flex items-center justify-center shrink-0 z-10">
                <span className="text-sm font-bold text-[var(--color-accent-light)]">
                  {step.step}
                </span>
              </div>
              <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5 pb-4">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-medium">{step.title}</h3>
                  <span className="text-xs text-[var(--color-muted)] whitespace-nowrap">
                    {step.estimatedTime}
                  </span>
                </div>
                <p className="text-sm text-[var(--color-muted)] mt-2">{step.description}</p>
                {step.resources.length > 0 && (
                  <div className="mt-3 flex items-start gap-2">
                    <BookOpen className="w-4 h-4 text-[var(--color-accent-light)] shrink-0 mt-0.5" />
                    <div className="flex flex-wrap gap-2">
                      {step.resources.map((r) => (
                        <span
                          key={r}
                          className="text-xs px-2 py-1 rounded-md bg-[var(--color-surface-elevated)] text-[var(--color-muted)]"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
