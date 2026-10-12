import { LeaderboardRankBadge } from "./leaderboard-rank-badge";

export type LeaderboardPodiumEntry = {
  rank: number;
  userId: string;
  username: string;
  finalScore: number;
  validSetsFound: number;
};

type LeaderboardPodiumProps = {
  entries: LeaderboardPodiumEntry[];
  highlightUserId?: string;
};

const slotOrder = [2, 1, 3] as const;

const slotShell: Record<1 | 2 | 3, string> = {
  1:
    "min-h-[9.5rem] border-leaderboard-gold-fg/20 bg-leaderboard-gold-bg shadow-[var(--shadow-card-hover)]",
  2:
    "min-h-[7.5rem] border-leaderboard-silver-fg/20 bg-leaderboard-silver-bg",
  3:
    "min-h-[7rem] border-leaderboard-bronze-fg/20 bg-leaderboard-bronze-bg",
};

function findByRank(
  entries: LeaderboardPodiumEntry[],
  rank: number,
): LeaderboardPodiumEntry | undefined {
  return entries.find((e) => e.rank === rank);
}

export function LeaderboardPodium({
  entries,
  highlightUserId,
}: LeaderboardPodiumProps) {
  const topThree = entries.filter((e) => e.rank >= 1 && e.rank <= 3);
  if (topThree.length === 0) return null;

  return (
    <div
      className="grid grid-cols-3 items-end gap-2 sm:gap-3"
      aria-label="Podium top 3"
    >
      {slotOrder.map((rank) => {
        const entry = findByRank(topThree, rank);
        const highlighted =
          Boolean(entry && highlightUserId && entry.userId === highlightUserId);

        return (
          <div
            key={rank}
            className={`relative flex min-w-0 flex-col rounded-2xl border px-1.5 pb-3 pt-3 text-center transition-[transform,box-shadow] duration-[var(--motion-normal)] sm:px-4 sm:pt-4 ${slotShell[rank]} ${
              highlighted ? "ring-2 ring-accent/50" : ""
            } ${rank === 1 ? "sm:-translate-y-1" : ""}`}
          >
            <div className="mx-auto -mt-4 mb-2 sm:-mt-6">
              <LeaderboardRankBadge rank={rank} size="md" />
            </div>
            {entry ? (
              <>
                <p className="truncate font-display text-sm font-semibold text-foreground sm:text-base">
                  {entry.username}
                </p>
                {highlighted ? (
                  <p className="text-[0.65rem] font-semibold uppercase tracking-wide text-accent">
                    Jij
                  </p>
                ) : null}
                <p
                  className={`mt-2 font-mono text-xl font-semibold tabular-nums sm:text-3xl ${
                    rank === 1
                      ? "text-leaderboard-gold-fg"
                      : rank === 2
                        ? "text-leaderboard-silver-fg"
                        : "text-leaderboard-bronze-fg"
                  }`}
                >
                  {entry.finalScore}
                </p>
                <p className="mt-1 text-xs text-muted">
                  {entry.validSetsFound} SET
                  {entry.validSetsFound === 1 ? "" : "s"}
                </p>
              </>
            ) : (
              <p className="mt-4 text-sm text-muted">—</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
