import Link from "next/link";
import type { GameModeId } from "@/core/game-modes";
import { btnPrimary, panel } from "@/shared/presentation/ui/styles";

export type DashboardGameRow = {
  id: string;
  modeId: GameModeId;
  modeLabel: string;
  finalScore: number;
  validSetsFound: number;
  moves: number;
  endedAt: Date;
};

type DashboardGameHistoryProps = {
  games: DashboardGameRow[];
  error?: boolean;
};

function formatWhen(date: Date): string {
  return date.toLocaleString("nl-NL", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function DashboardGameHistory({
  games,
  error = false,
}: DashboardGameHistoryProps) {
  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Geschiedenis
          </p>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Recente spellen
          </h2>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-danger" role="alert">
          Recente spellen kunnen nu niet worden geladen.
        </p>
      ) : games.length === 0 ? (
        <div
          className={`${panel} rounded-2xl border-dashed px-6 py-10 text-center`}
        >
          <p className="font-display text-lg font-semibold text-foreground">
            Nog geen resultaten
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
            Speel Classic of Time Attack terwijl je ingelogd bent — je scores
            verschijnen hier.
          </p>
          <Link href="/play?mode=classic" className={`${btnPrimary} mt-6`}>
            Start Classic
          </Link>
        </div>
      ) : (
        <ul className={`${panel} divide-y divide-border overflow-hidden rounded-2xl`}>
          {games.map((game) => (
            <li
              key={game.id}
              className="flex flex-wrap items-center gap-3 px-4 py-3.5 sm:flex-nowrap sm:justify-between"
            >
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    game.modeId === "time_attack"
                      ? "border border-competition/30 bg-competition/10 text-competition"
                      : "border border-accent/25 bg-accent-muted/50 text-accent"
                  }`}
                >
                  {game.modeLabel}
                </span>
                <div className="min-w-0">
                  <p className="font-mono text-lg font-semibold tabular-nums text-foreground">
                    {game.finalScore}
                    <span className="ml-1 text-sm font-normal text-muted">
                      punten
                    </span>
                  </p>
                  <p className="text-xs text-muted">
                    {game.validSetsFound}{" "}
                    {game.validSetsFound === 1 ? "SET" : "SETs"} · {game.moves}{" "}
                    {game.moves === 1 ? "zet" : "zetten"}
                  </p>
                </div>
              </div>
              <time
                className="text-sm text-muted sm:text-right"
                dateTime={game.endedAt.toISOString()}
              >
                {formatWhen(game.endedAt)}
              </time>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
