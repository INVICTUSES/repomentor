import type { PRChecklistItem } from "@/lib/types";
import { CheckSquare, FlaskConical } from "lucide-react";

const CATEGORY_ICONS: Record<PRChecklistItem["category"], string> = {
  code: "💻",
  tests: "🧪",
  docs: "📄",
  process: "📋",
};

export function PRChecklist({
  checklist,
  testSuggestions,
}: {
  checklist: PRChecklistItem[];
  testSuggestions: string[];
}) {
  return (
    <section className="animate-fade-in animate-fade-in-delay-3">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-[var(--color-accent-light)]" />
            <h2 className="text-xl font-semibold">PR Checklist</h2>
          </div>
          <ul className="space-y-2">
            {checklist.map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3"
              >
                <span className="text-base">{CATEGORY_ICONS[item.category]}</span>
                <div>
                  <p className="text-sm">{item.item}</p>
                  <p className="text-xs text-[var(--color-muted)] capitalize mt-0.5">
                    {item.category}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical className="w-5 h-5 text-[var(--color-accent-light)]" />
            <h2 className="text-xl font-semibold">Test Suggestions</h2>
          </div>
          <ul className="space-y-2">
            {testSuggestions.map((s, i) => (
              <li
                key={i}
                className="flex items-start gap-3 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-lg px-4 py-3 text-sm"
              >
                <span className="text-[var(--color-success)]">✓</span>
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
