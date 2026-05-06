'use client';

interface ProgressBarProps {
  current: number;
  total: number;
  labels?: string[];
}

export function ProgressBar({ current, total, labels }: ProgressBarProps) {
  const pct = Math.round(((current + 1) / total) * 100);
  return (
    <div className="w-full">
      <p className="mb-2 text-sm font-medium text-gray-600" aria-live="polite">
        Étape {current + 1} sur {total}
      </p>

      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Progression du parcours"
        className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200"
      >
        <div
          className="h-full rounded-full bg-[var(--color-brand)] transition-[width] duration-300 ease-out motion-reduce:transition-none"
          style={{ width: `${pct}%` }}
        />
      </div>

      {/* Numbered milestones — purely decorative, hidden from AT to avoid duplicating
          the role="progressbar" announcement. */}
      <ol aria-hidden="true" className="mt-3 flex justify-between text-xs font-medium">
        {Array.from({ length: total }).map((_, i) => {
          const reached = i <= current;
          return (
            <li
              key={i}
              className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                reached
                  ? 'border-[var(--color-brand)] bg-[var(--color-brand)] text-white'
                  : 'border-gray-300 bg-white text-gray-400'
              }`}
              title={labels?.[i]}
            >
              {i + 1}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
