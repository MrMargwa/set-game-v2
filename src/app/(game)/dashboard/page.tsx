import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { GameSessionRepository } from "@/modules/games/infrastructure/game-session-repository";
import { LogoutButton } from "@/modules/accounts/presentation/logout-button";
import { getUserStatistics } from "@/modules/statistics/application/get-user-statistics";
import { UserStatsCards } from "@/modules/statistics/presentation/user-stats-cards";
import {
  btnPrimary,
  btnSecondary,
  pageLead,
  pageTitle,
  panel,
} from "@/shared/presentation/ui/styles";

export default async function DashboardPage() {
  const user = await getAuthenticatedUser();
  if (!user) {
    redirect("/login");
  }

  let history: Awaited<ReturnType<GameSessionRepository["listForUser"]>> = [];
  const statsResult = await getUserStatistics(user.id);
  const statistics = statsResult.ok ? statsResult.data : null;

  try {
    const repo = new GameSessionRepository();
    history = await repo.listForUser(user.id);
  } catch {
    history = [];
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className={pageTitle}>Dashboard</h1>
          <p className={pageLead}>
            Ingelogd als <span className="font-medium text-foreground">{user.username}</span>
          </p>
        </div>
        <LogoutButton />
      </header>

      <div className="flex flex-wrap gap-3">
        <Link href="/play?mode=classic" className={btnPrimary}>
          Speel Classic SET
        </Link>
        <Link href="/leaderboards" className={btnSecondary}>
          Leaderboard
        </Link>
        <Link href="/" className={btnSecondary}>
          Home
        </Link>
      </div>

      {statistics && <UserStatsCards statistics={statistics} />}

      <section>
        <h2 className="font-display text-lg font-semibold">Recente spellen</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-muted">
            Nog geen opgeslagen resultaten. Speel een rondje terwijl je ingelogd bent.
          </p>
        ) : (
          <ul className={`${panel} mt-4 divide-y divide-border`}>
            {history.map((game) => (
              <li
                key={game.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
              >
                <span className="font-medium capitalize">{game.modeId}</span>
                <span>
                  Score {game.finalScore} · {game.validSetsFound} SETs ·{" "}
                  {game.moves} zetten
                </span>
                <span className="text-muted">
                  {game.endedAt.toLocaleString("nl-NL")}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
