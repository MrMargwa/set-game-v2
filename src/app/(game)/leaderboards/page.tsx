import Link from "next/link";
import { parseGameModeId } from "@/core/game-modes";
import { getAuthenticatedUser } from "@/modules/accounts/application/get-authenticated-user";
import { LeaderboardPanel } from "@/modules/leaderboards/presentation/leaderboard-panel";
import type { LeaderboardScope } from "@/modules/leaderboards/domain/types";
import { linkAccent, pageLead, pageTitle } from "@/shared/presentation/ui/styles";

type LeaderboardsPageProps = {
  searchParams: Promise<{ mode?: string; scope?: string }>;
};

function parseScope(value: string | undefined): LeaderboardScope {
  return value === "top_runs" ? "top_runs" : "personal_best";
}

export default async function LeaderboardsPage({ searchParams }: LeaderboardsPageProps) {
  const params = await searchParams;
  const modeId = parseGameModeId(params.mode);
  const scope = parseScope(params.scope);
  const user = await getAuthenticatedUser();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-10">
      <header>
        <h1 className={pageTitle}>Leaderboard</h1>
        <p className={pageLead}>
          Solo-resultaten uit opgeslagen spellen. Log in en speel om op het bord te
          verschijnen.
        </p>
        <Link href="/dashboard" className={`${linkAccent} mt-3 inline-block text-sm`}>
          Jouw statistieken op het dashboard →
        </Link>
      </header>

      <LeaderboardPanel
        initialModeId={modeId}
        initialScope={scope}
        highlightUserId={user?.id}
      />
    </div>
  );
}
