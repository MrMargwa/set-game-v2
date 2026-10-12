import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { listGameModes, type GameModeId } from "@/core/game-modes";
import { getAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { LogoutButton } from "@/modules/accounts/presentation/logout-button";
import { GameSessionRepository } from "@/modules/games/infrastructure/game-session-repository";
import { getUserStatistics } from "@/modules/statistics/application/get-user-statistics";
import { DashboardGameHistory } from "@/modules/statistics/presentation/dashboard-game-history";
import { UserStatsCards } from "@/modules/statistics/presentation/user-stats-cards";
import {
  btnPrimaryPill,
  btnSecondaryPill,
  pageLead,
  pageTitle,
} from "@/shared/presentation/ui/styles";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  let history: Awaited<ReturnType<GameSessionRepository["listForUser"]>> = [];
  let historyError = false;
  const statsResult = await getUserStatistics(user.id);

  try {
    const repo = new GameSessionRepository();
    history = await repo.listForUser(user.id);
  } catch {
    historyError = true;
  }

  const modeNames = new Map<string, string>(
    listGameModes().map((mode) => [mode.id, mode.displayName]),
  );

  const historyRows = history.map((game) => ({
    id: game.id,
    modeId: game.modeId as GameModeId,
    modeLabel: modeNames.get(game.modeId) ?? game.modeId,
    finalScore: game.finalScore,
    validSetsFound: game.validSetsFound,
    moves: game.moves,
    endedAt: game.endedAt,
  }));

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-6 sm:gap-10 sm:py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Profiel
          </p>
          <h1 className={`${pageTitle} mt-2 text-3xl sm:text-4xl`}>
            Dashboard
          </h1>
          <p className={`${pageLead} max-w-xl text-base`}>
            Ingelogd als{" "}
            <span className="font-medium text-foreground">{user.username}</span>
            . Hier zie je je solo-statistieken en recente spellen.
          </p>
        </div>
        <LogoutButton />
      </header>

      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <Link href="/play?mode=classic" className={`${btnPrimaryPill} w-full sm:w-auto`}>
          Nu spelen
        </Link>
        <Link href="/lobby" className={`${btnSecondaryPill} w-full sm:w-auto`}>
          Lobby
        </Link>
        <Link href="/leaderboards" className={`${btnSecondaryPill} w-full sm:w-auto`}>
          Leaderboard
        </Link>
      </div>

      {statsResult.ok ? (
        <UserStatsCards statistics={statsResult.data} />
      ) : (
        <p className="text-sm text-danger" role="alert">
          {statsResult.message}
        </p>
      )}

      <DashboardGameHistory games={historyRows} error={historyError} />
    </div>
  );
}
