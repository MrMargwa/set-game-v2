"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { listGameModes, type GameModeId } from "@/core/game-modes";
import {
  alertDanger,
  btnPrimary,
  linkAccent,
  panel,
  pillActive,
  pillInactive,
} from "@/shared/presentation/ui/styles";
import { isGameModePlayable } from "@/shared/config/game-availability";
import { ComingSoonBadge } from "@/shared/presentation/ui/coming-soon-badge";
import type { LeaderboardScope } from "../domain/types";
import { LeaderboardPodium } from "./leaderboard-podium";
import { LeaderboardRankBadge } from "./leaderboard-rank-badge";

type LeaderboardEntryDto = {
  rank: number;
  userId: string;
  username: string;
  finalScore: number;
  validSetsFound: number;
  moves: number;
  endedAt: string;
};

type LeaderboardPanelProps = {
  initialModeId: GameModeId;
  initialScope: LeaderboardScope;
  highlightUserId?: string;
};

function rankRowClass(rank: number, highlighted: boolean): string {
  if (highlighted) {
    return "bg-accent-muted/35 ring-1 ring-inset ring-accent/25";
  }
  if (rank === 1) return "bg-leaderboard-gold-bg/50";
  if (rank === 2) return "bg-leaderboard-silver-bg/50";
  if (rank === 3) return "bg-leaderboard-bronze-bg/50";
  return "hover:bg-surface-elevated/80";
}

function formatEndedAt(iso: string): string {
  return new Date(iso).toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function LeaderboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 animate-pulse">
      <div className="grid grid-cols-3 items-end gap-3">
        {[7.5, 9.5, 7].map((h, i) => (
          <div
            key={i}
            className="rounded-2xl border border-border bg-surface-elevated"
            style={{ minHeight: `${h}rem` }}
          />
        ))}
      </div>
      <div className={`${panel} divide-y divide-border`}>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3">
            <div className="size-8 rounded-full bg-surface-elevated" />
            <div className="h-4 flex-1 rounded bg-surface-elevated" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function LeaderboardPanel({
  initialModeId,
  initialScope,
  highlightUserId,
}: LeaderboardPanelProps) {
  const modes = listGameModes();
  const [modeId, setModeId] = useState<GameModeId>(
    isGameModePlayable(initialModeId) ? initialModeId : "classic",
  );
  const [scope, setScope] = useState<LeaderboardScope>(initialScope);
  const [entries, setEntries] = useState<LeaderboardEntryDto[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        mode: modeId,
        scope,
        limit: "25",
      });
      const res = await fetch(`/api/leaderboards?${params.toString()}`);
      const data = (await res.json()) as {
        leaderboard?: { entries: LeaderboardEntryDto[] };
        error?: string;
      };
      if (!res.ok) {
        setError(data.error ?? "Het leaderboard kon niet worden geladen.");
        setEntries([]);
        return;
      }
      setEntries(data.leaderboard?.entries ?? []);
      setError(null);
    } catch {
      setError("Geen verbinding. Probeer het opnieuw.");
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [modeId, scope]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void load();
    }, 0);
    return () => clearTimeout(timeout);
  }, [load]);

  const scopeLabel =
    scope === "personal_best"
      ? "Beste score per speler"
      : "Elk opgeslagen spel telt mee.";

  return (
    <div className="flex flex-col gap-6">
      <div
        className={`${panel} overflow-hidden shadow-[var(--shadow-card)]`}
      >
        <div className="border-b border-border bg-surface-elevated/80 px-4 py-4 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Scores
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {modes.map((mode) => {
              const playable = isGameModePlayable(mode.id);
              if (!playable) {
                return (
                  <span
                    key={mode.id}
                    className={`${pillInactive} inline-flex cursor-not-allowed items-center gap-1.5 opacity-80`}
                    title="Binnenkort beschikbaar"
                  >
                    {mode.displayName}
                    <ComingSoonBadge />
                  </span>
                );
              }
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setModeId(mode.id)}
                  className={mode.id === modeId ? pillActive : pillInactive}
                >
                  {mode.displayName}
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setScope("personal_best")}
              className={
                scope === "personal_best" ? pillActive : pillInactive
              }
            >
              Beste per speler
            </button>
            <button
              type="button"
              onClick={() => setScope("top_runs")}
              className={scope === "top_runs" ? pillActive : pillInactive}
            >
              Alle spellen
            </button>
          </div>
          <p className="mt-3 text-xs text-muted">{scopeLabel}</p>
        </div>

        <div className="px-3 pb-5 pt-6 sm:px-5">
          {error && (
            <p className={`${alertDanger} mb-4`} role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <LeaderboardSkeleton />
          ) : error ? null : entries.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border bg-surface-elevated/50 px-6 py-10 text-center">
              <p className="font-display text-lg font-semibold text-foreground">
                Nog geen scores
              </p>
              <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
                Speel een spel terwijl je ingelogd bent. Je score komt dan op
                dit leaderboard.
              </p>
              <Link
                href={`/play?mode=${modeId}`}
                className={`${btnPrimary} mt-6`}
              >
                Speel {modes.find((m) => m.id === modeId)?.displayName ?? "nu"}
              </Link>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              <LeaderboardPodium
                entries={entries}
                highlightUserId={highlightUserId}
              />

              {entries.length > 3 ? (
              <div className="overflow-x-auto rounded-xl border border-border">
                <table
                  className="min-w-full text-left text-sm"
                  data-testid="leaderboard-table"
                >
                  <thead className="border-b border-border bg-surface-elevated text-xs font-medium uppercase tracking-[0.1em] text-muted">
                    <tr>
                      <th className="px-2 py-3 font-medium sm:px-4">Rang</th>
                      <th className="px-2 py-3 font-medium sm:px-4">Speler</th>
                      <th className="px-2 py-3 font-medium sm:px-4">Score</th>
                      <th className="hidden px-4 py-3 font-medium sm:table-cell">
                        SETs
                      </th>
                      <th className="hidden px-4 py-3 font-medium md:table-cell">
                        Zetten
                      </th>
                      <th className="hidden px-4 py-3 font-medium sm:table-cell">
                        Datum
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {entries.slice(3).map((entry) => {
                      const highlighted = Boolean(
                        highlightUserId && entry.userId === highlightUserId,
                      );
                      return (
                        <tr
                          key={`${entry.userId}-${entry.rank}-${entry.endedAt}`}
                          className={`transition-colors duration-[var(--motion-fast)] ${rankRowClass(
                            entry.rank,
                            highlighted,
                          )}`}
                        >
                          <td className="px-2 py-3 sm:px-4">
                            <LeaderboardRankBadge rank={entry.rank} />
                          </td>
                          <td className="max-w-[8rem] px-2 py-3 sm:max-w-none sm:px-4">
                            <span className="block truncate font-medium text-foreground">
                              {entry.username}
                            </span>
                            {highlighted ? (
                              <span className="mt-1 inline-flex rounded-full bg-accent/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide text-accent">
                                Jij
                              </span>
                            ) : null}
                            <span className="mt-0.5 block text-xs text-muted sm:hidden">
                              {entry.validSetsFound}{" "}
                              {entry.validSetsFound === 1 ? "SET" : "SETs"} ·{" "}
                              {formatEndedAt(entry.endedAt)}
                            </span>
                          </td>
                          <td className="px-2 py-3 font-mono text-base font-semibold tabular-nums sm:px-4">
                            {entry.finalScore}
                          </td>
                          <td className="hidden px-4 py-3 font-mono tabular-nums sm:table-cell">
                            {entry.validSetsFound}
                          </td>
                          <td className="hidden px-4 py-3 font-mono tabular-nums md:table-cell">
                            {entry.moves}
                          </td>
                          <td className="hidden whitespace-nowrap px-4 py-3 text-muted sm:table-cell">
                            {formatEndedAt(entry.endedAt)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              ) : null}

              <p className="text-center text-xs text-muted">
                Top 25 ·{" "}
                <Link href={`/play?mode=${modeId}`} className={linkAccent}>
                  Speel om te klimmen
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
