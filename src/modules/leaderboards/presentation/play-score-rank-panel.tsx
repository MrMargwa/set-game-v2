"use client";

import { useEffect, useState } from "react";
import type { GameModeId } from "@/core/game-modes";

type Entry = {
  rank: number;
  userId: string;
  username: string;
  finalScore: number;
  validSetsFound: number;
};

type PlayScoreRankPanelProps = {
  modeId: GameModeId;
  refreshToken: string;
  title: string;
  subtitle: string;
  highlightUserId?: string;
};

export function PlayScoreRankPanel({
  modeId,
  refreshToken,
  title,
  subtitle,
  highlightUserId,
}: PlayScoreRankPanelProps) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const params = new URLSearchParams({
      mode: modeId,
      scope: "personal_best",
      limit: "25",
    });
    void fetch(`/api/leaderboards?${params}`)
      .then(async (response) => {
        const data = (await response.json()) as {
          leaderboard?: { entries: Entry[] };
          error?: string;
        };
        if (!response.ok) {
          throw new Error(data.error ?? "Leaderboard laden mislukt.");
        }
        return data.leaderboard?.entries ?? [];
      })
      .then((next) => {
        if (!cancelled) {
          setEntries(next);
          setError(null);
        }
      })
      .catch((cause: unknown) => {
        if (!cancelled) {
          setError(
            cause instanceof Error ? cause.message : "Leaderboard laden mislukt.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, [modeId, refreshToken]);

  const body = (
    <>
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-accent">
        {title}
      </p>
      <p className="mt-1 text-xs text-muted">{subtitle}</p>
      {error ? (
        <p className="mt-3 text-sm text-danger" role="alert">{error}</p>
      ) : entries.length === 0 ? (
        <p className="mt-3 text-sm text-muted">Nog geen scores opgeslagen.</p>
      ) : (
        <ol className="mt-2 flex flex-col gap-1">
          {entries.map((entry) => {
            const highlighted =
              highlightUserId && entry.userId === highlightUserId;
            return (
              <li
                key={`${entry.userId}-${entry.rank}`}
                className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                  highlighted
                    ? "bg-accent-muted/50 ring-1 ring-accent/30"
                    : "bg-surface-elevated"
                }`}
              >
                <span className="w-5 shrink-0 font-mono text-xs font-semibold tabular-nums text-muted">
                  {entry.rank}
                </span>
                <span className="min-w-0 flex-1 truncate font-medium">
                  {entry.username}
                </span>
                <span className="shrink-0 font-mono text-sm font-semibold tabular-nums">
                  {entry.finalScore}
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </>
  );

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto rounded-xl border border-border bg-surface p-3 shadow-[var(--shadow-card)]">
      {body}
    </div>
  );
}
