import Link from "next/link";
import { listGameModes } from "@/core/game-modes";
import { linkAccent, panel } from "@/shared/presentation/ui/styles";
import type { UserStatistics } from "../domain/types";

type UserStatsCardsProps = {
  statistics: UserStatistics;
};

export function UserStatsCards({ statistics }: UserStatsCardsProps) {
  const modeMeta = listGameModes();

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-semibold">Statistieken</h2>
        <Link href="/leaderboards" className={linkAccent}>
          Leaderboard →
        </Link>
      </div>

      <p className="text-sm text-muted">
        {statistics.totalGamesPlayed === 0
          ? "Nog geen opgeslagen solo-spellen."
          : `${statistics.totalGamesPlayed} opgeslagen solo-spel${
              statistics.totalGamesPlayed === 1 ? "" : "len"
            } totaal.`}
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        {statistics.byMode.map((mode) => {
          const meta = modeMeta.find((m) => m.id === mode.modeId);
          return (
            <div
              key={mode.modeId}
              className={`${panel} p-4`}
              data-testid={`stats-${mode.modeId}`}
            >
              <h3 className="font-semibold">{meta?.displayName ?? mode.modeId}</h3>
              {mode.gamesPlayed === 0 ? (
                <p className="mt-2 text-sm text-muted">Nog niet gespeeld</p>
              ) : (
                <ul className="mt-2 space-y-1 text-sm text-foreground/90">
                  <li>
                    Spellen: <span className="font-medium">{mode.gamesPlayed}</span>
                  </li>
                  <li>
                    Beste score:{" "}
                    <span className="font-mono font-medium tabular-nums">
                      {mode.bestScore}
                    </span>
                  </li>
                  <li>
                    Gemiddelde:{" "}
                    <span className="font-mono font-medium tabular-nums">
                      {mode.averageScore}
                    </span>
                  </li>
                  <li>
                    SETs totaal:{" "}
                    <span className="font-mono font-medium tabular-nums">
                      {mode.totalValidSets}
                    </span>
                  </li>
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
