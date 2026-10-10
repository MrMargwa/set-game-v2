"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { listGameModes, type GameModeId } from "@/core/game-modes";
import {
  alertDanger,
  linkAccent,
  panel,
  pillActive,
  pillInactive,
} from "@/shared/presentation/ui/styles";
import type { LeaderboardScope } from "../domain/types";

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
  if (highlighted) return "bg-accent-muted/40";
  if (rank === 1) return "bg-[#fef3c7]/80 dark:bg-[#422006]/60";
  if (rank === 2) return "bg-[#f1f5f9]/80 dark:bg-[#1e293b]/60";
  if (rank === 3) return "bg-[#ffedd5]/80 dark:bg-[#431407]/60";
  return "";
}

export function LeaderboardPanel({
  initialModeId,
  initialScope,
  highlightUserId,
}: LeaderboardPanelProps) {
  const modes = listGameModes();
  const [modeId, setModeId] = useState(initialModeId);
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
        setError(data.error ?? "Leaderboard laden mislukt.");
        setEntries([]);
        return;
      }
      setEntries(data.leaderboard?.entries ?? []);
      setError(null);
    } catch {
      setError("Netwerkfout.");
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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap gap-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            type="button"
            onClick={() => setModeId(mode.id)}
            className={mode.id === modeId ? pillActive : pillInactive}
          >
            {mode.displayName}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 text-sm">
        <button
          type="button"
          onClick={() => setScope("personal_best")}
          className={
            scope === "personal_best"
              ? pillActive
              : `${pillInactive} rounded-lg px-3 py-1.5`
          }
        >
          Beste score per speler
        </button>
        <button
          type="button"
          onClick={() => setScope("top_runs")}
          className={
            scope === "top_runs"
              ? pillActive
              : `${pillInactive} rounded-lg px-3 py-1.5`
          }
        >
          Top runs (alle spellen)
        </button>
      </div>

      {error && (
        <p className={alertDanger} role="alert">
          {error}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-muted">Laden…</p>
      ) : entries.length === 0 ? (
        <p className="text-sm text-muted">
          Nog geen resultaten voor deze mode.{" "}
          <Link href={`/play?mode=${modeId}`} className={linkAccent}>
            Speel een rondje
          </Link>{" "}
          terwijl je ingelogd bent.
        </p>
      ) : (
        <div className={`${panel} overflow-x-auto`}>
          <table className="min-w-full text-left text-sm" data-testid="leaderboard-table">
            <thead className="border-b border-border bg-surface-elevated text-muted">
              <tr>
                <th className="px-4 py-2 font-medium">#</th>
                <th className="px-4 py-2 font-medium">Speler</th>
                <th className="px-4 py-2 font-medium">Score</th>
                <th className="px-4 py-2 font-medium">SETs</th>
                <th className="px-4 py-2 font-medium">Zetten</th>
                <th className="px-4 py-2 font-medium">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {entries.map((entry) => (
                <tr
                  key={`${entry.userId}-${entry.rank}-${entry.endedAt}`}
                  className={rankRowClass(
                    entry.rank,
                    Boolean(highlightUserId && entry.userId === highlightUserId),
                  )}
                >
                  <td className="px-4 py-2 font-mono tabular-nums">{entry.rank}</td>
                  <td className="px-4 py-2 font-medium">{entry.username}</td>
                  <td className="px-4 py-2 font-mono tabular-nums">
                    {entry.finalScore}
                  </td>
                  <td className="px-4 py-2 font-mono tabular-nums">
                    {entry.validSetsFound}
                  </td>
                  <td className="px-4 py-2 font-mono tabular-nums">{entry.moves}</td>
                  <td className="px-4 py-2 text-muted">
                    {new Date(entry.endedAt).toLocaleString("nl-NL")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
