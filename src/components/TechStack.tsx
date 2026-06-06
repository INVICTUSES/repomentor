import type { TechStackItem } from "@/lib/types";
import { Cpu } from "lucide-react";

const CONFIDENCE_STYLES = {
  high: "bg-[var(--color-success)]/15 text-[var(--color-success)] border-[var(--color-success)]/30",
  medium: "bg-[var(--color-warning)]/15 text-[var(--color-warning)] border-[var(--color-warning)]/30",
  low: "bg-[var(--color-muted)]/15 text-[var(--color-muted)] border-[var(--color-muted)]/30",
};

export function TechStack({ items }: { items: TechStackItem[] }) {
  return (
    <section className="animate-fade-in animate-fade-in-delay-1">
      <div className="flex items-center gap-2 mb-4">
        <Cpu className="w-5 h-5 text-[var(--color-accent-light)]" />
        <h2 className="text-xl font-semibold">Tech Stack</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {items.map((item) => (
          <div
            key={`${item.category}-${item.name}`}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-4 hover:border-[var(--color-accent)]/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-[var(--color-muted)]">{item.category}</p>
              </div>
              <span
                className={`text-xs px-2 py-0.5 rounded-full border ${CONFIDENCE_STYLES[item.confidence]}`}
              >
                {item.confidence}
              </span>
            </div>
            <p className="text-xs text-[var(--color-muted)] mt-2 font-mono">
              {item.evidence}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
