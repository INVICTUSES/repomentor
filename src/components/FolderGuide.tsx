import type { FolderExplanation } from "@/lib/types";
import { FolderTree, Lightbulb } from "lucide-react";

export function FolderGuide({ folders }: { folders: FolderExplanation[] }) {
  return (
    <section className="animate-fade-in animate-fade-in-delay-2">
      <div className="flex items-center gap-2 mb-4">
        <FolderTree className="w-5 h-5 text-[var(--color-accent-light)]" />
        <h2 className="text-xl font-semibold">Folder Guide</h2>
      </div>
      <div className="space-y-3">
        {folders.map((folder) => (
          <div
            key={folder.path}
            className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl p-5"
          >
            <code className="text-[var(--color-accent-light)] font-mono text-sm font-medium">
              {folder.path}
            </code>
            <p className="mt-2 text-[var(--color-foreground)]/90">{folder.purpose}</p>
            {folder.keyFiles.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {folder.keyFiles.map((f) => (
                  <span
                    key={f}
                    className="text-xs font-mono px-2 py-1 rounded-md bg-[var(--color-surface-elevated)] text-[var(--color-muted)]"
                  >
                    {f}
                  </span>
                ))}
              </div>
            )}
            {folder.beginnerTip && (
              <div className="mt-3 flex items-start gap-2 text-sm text-[var(--color-warning)]">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{folder.beginnerTip}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
