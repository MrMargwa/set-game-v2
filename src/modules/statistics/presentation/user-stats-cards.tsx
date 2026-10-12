import Link from "next/link";
import type { GameModeId } from "@/core/game-modes";
import { listGameModes } from "@/core/game-modes";
import {
  IconModeClassic,
  IconModeTime,
} from "@/shared/presentation/ui/mode-icons";
import { linkAccent, panel } from "@/shared/presentation/ui/styles";
import type { UserStatistics } from "../domain/types";

type UserStatsCardsProps = {
  statistics: UserStatistics;
};

function ModeIcon({ modeId }: { modeId: GameModeId }) {
  if (modeId === "time_attack") {
    return <IconModeTime className="size-8" />;
  }
  return <IconModeClassic className="size-8" />;
}

function StatChip({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface-elevated/80 px-3 py-2">
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted">
        {label}
      </p>
      <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-foreground">
        {value}
      </p>
    </div>
  );
}

export function UserStatsCards({ statistics }: UserStatsCardsProps) {
  const modeMeta = listGameModes();

  const bestOverall = statistics.byMode.reduce(
    (max, mode) => Math.max(max, mode.bestScore),
    0,
  );
  const totalSets = statistics.byMode.reduce(
    (sum, mode) => sum + mode.totalValidSets,
    0,
  );

  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Overzicht
          </p>
          <h2 className="font-display text-xl font-semibold text-foreground">
            Statistieken
          </h2>
        </div>
        <Link href="/leaderboards" className={linkAccent}>
          Leaderboard →
        </Link>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className={`${panel} rounded-2xl p-4`}>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted">
            Spellen
          </p>
          <p
            className="mt-1 font-mono text-3xl font-semibold tabular-nums"
            data-testid="stats-total-games"
          >
            {statistics.totalGamesPlayed}
          </p>
        </div>
        <div className={`${panel} rounded-2xl p-4`}>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted">
            Beste score
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tabular-nums text-competition">
            {bestOverall}
          </p>
        </div>
        <div className={`${panel} rounded-2xl p-4`}>
          <p className="text-xs font-medium uppercase tracking-[0.1em] text-muted">
            SETs totaal
          </p>
          <p className="mt-1 font-mono text-3xl font-semibold tabular-nums">
            {totalSets}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {modeMeta.map((meta) => {
          const mode = statistics.byMode.find((m) => m.modeId === meta.id);
          const gamesPlayed = mode?.gamesPlayed ?? 0;

          return (
            <article
              key={meta.id}
              className={`${panel} rounded-2xl p-5`}
              data-testid={`stats-${meta.id}`}
            >
              <div className="flex items-start gap-4">
                <div
                  className={`grid size-14 shrink-0 place-items-center rounded-2xl border sm:size-[4.25rem] ${
                    meta.id === "time_attack"
                      ? "border-competition/35 bg-gradient-to-br from-competition/15 to-competition/5 text-competition"
                      : "border-accent/30 bg-gradient-to-br from-accent-muted/70 to-surface text-accent"
                  }`}
                >
                  <ModeIcon modeId={meta.id} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-display text-lg font-semibold">
                    {meta.displayName}
                  </h3>
                  <p className="mt-1 text-sm text-muted">{meta.description}</p>
                </div>
              </div>

              {gamesPlayed === 0 ? (
                <p className="mt-5 rounded-xl border border-dashed border-border bg-surface-elevated/50 px-4 py-3 text-sm text-muted">
                  Nog niet gespeeld —{" "}
                  <Link
                    href={`/play?mode=${meta.id}`}
                    className="font-medium text-accent hover:text-accent-hover"
                  >
                    start een spel
                  </Link>
                </p>
              ) : (
                <div className="mt-5 grid grid-cols-2 gap-2">
                  <StatChip label="Spellen" value={gamesPlayed} />
                  <StatChip label="Beste" value={mode?.bestScore ?? 0} />
                  <StatChip label="Gemiddeld" value={mode?.averageScore ?? 0} />
                  <StatChip
                    label="SETs"
                    value={mode?.totalValidSets ?? 0}
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
