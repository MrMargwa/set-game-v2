"use client";

import { useEffect, useState } from "react";

type FastestClear = {
  rank: number;
  userId: string;
  username: string;
  finalScore: number;
  validSetsFound: number;
  durationMs: number;
};

type FastestClearsPanelProps = {
  modeId: string;
  refreshToken: string;
};

function formatDuration(ms: number): string {
  const clamped = Math.max(0, ms);
  const totalSeconds = Math.floor(clamped / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((clamped % 1000) / 100);
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${tenths}`;
}

export function FastestClearsPanel({ modeId, refreshToken }: FastestClearsPanelProps) {
  const [entries, setEntries] = useState<FastestClear[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void fetch(`/api/leaderboards/fastest?mode=${modeId}&limit=25`)
      .then(async (response) => {
        const data = (await response.json()) as { entries?: FastestClear[]; error?: string };
        if (!response.ok) {
          throw new Error(data.error ?? "Tijden laden mislukt.");
        }
        return data.entries ?? [];
      })
      .then((next) => {
        if (!cancelled) {
          setEntries(next);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(cause instanceof Error ? cause.message : "Tijden laden mislukt.");
        }
      });
    return () => {
      cancelled = true;
    };
  }, [modeId, refreshToken]);

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-y-auto rounded-xl border border-border bg-surface p-3 shadow-[var(--shadow-card)]">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-accent">
        Snelste tijden
      </p>
      <p className="mt-1 text-xs text-muted">Deck leeggespeeld · plek 1 tot 25</p>
      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">
          {error}
        </p>
      ) : entries.length === 0 ? (
        <p className="mt-3 text-sm text-muted">
          Nog niemand heeft het hele deck leeggespeeld.
        </p>
      ) : (
        <ol className="mt-3 flex flex-col gap-1.5">
          {entries.map((entry) => (
            <li
              key={entry.userId}
              className="flex items-center gap-2 rounded-lg bg-surface-elevated px-2 py-1.5"
            >
              <span className="w-6 shrink-0 font-mono text-sm font-semibold tabular-nums text-muted">
                {entry.rank}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">{entry.username}</span>
                <span className="block text-[0.65rem] text-muted">
                  {entry.finalScore} pt · {entry.validSetsFound} SETs
                </span>
              </span>
              <span className="shrink-0 font-mono text-sm font-semibold tabular-nums text-competition">
                {formatDuration(entry.durationMs)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </aside>
  );
}
