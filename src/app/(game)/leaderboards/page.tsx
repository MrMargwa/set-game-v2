import Link from "next/link";
import type { Metadata } from "next";
import { resolvePlayableModeId } from "@/shared/config/game-availability";
import { getAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { LeaderboardPanel } from "@/modules/leaderboards/presentation/leaderboard-panel";
import type { LeaderboardScope } from "@/modules/leaderboards/domain/types";
import {
  btnSecondaryPill,
  linkAccent,
  pageLead,
  pageTitle,
} from "@/shared/presentation/ui/styles";

export const metadata: Metadata = { title: "Leaderboard" };

type LeaderboardsPageProps = {
  searchParams: Promise<{ mode?: string; scope?: string }>;
};

function parseScope(value: string | undefined): LeaderboardScope {
  return value === "top_runs" ? "top_runs" : "personal_best";
}

export default async function LeaderboardsPage({
  searchParams,
}: LeaderboardsPageProps) {
  const params = await searchParams;
  const modeId = resolvePlayableModeId(params.mode);
  const scope = parseScope(params.scope);
  const user = await getAuthenticatedUser();

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Competitie
          </p>
          <h1 className={`${pageTitle} mt-2 text-3xl sm:text-4xl`}>
            Leaderboard
          </h1>
          <p className={`${pageLead} max-w-2xl text-base`}>
            Solo-scores uit opgeslagen spellen. Log in, speel een spel en zie waar
            je staat.
          </p>
          {user ? (
            <p className="mt-3 text-sm text-muted">
              Ingelogd als{" "}
              <span className="font-medium text-foreground">
                {user.username}
              </span>
              — je rij wordt gemarkeerd.
            </p>
          ) : (
            <p className="mt-3 text-sm text-muted">
              <Link href="/login" className={linkAccent}>
                Log in
              </Link>{" "}
              om scores op te slaan en je positie te zien.
            </p>
          )}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Link href="/play?mode=classic" className={`${btnSecondaryPill} w-full sm:w-auto`}>
            Nu spelen
          </Link>
          <Link href="/dashboard" className={`${btnSecondaryPill} w-full sm:w-auto`}>
            Dashboard
          </Link>
        </div>
      </header>

      <LeaderboardPanel
        initialModeId={modeId}
        initialScope={scope}
        highlightUserId={user?.id}
      />
    </div>
  );
}
