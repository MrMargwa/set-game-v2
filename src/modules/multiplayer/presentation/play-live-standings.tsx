type PlayerStanding = {
  userId: string;
  username: string;
  score: number;
  currentStreak?: number;
};

type PlayLiveStandingsProps = {
  players: PlayerStanding[];
  currentUserId: string;
};

export function PlayLiveStandings({
  players,
  currentUserId,
}: PlayLiveStandingsProps) {
  const sorted = [...players].sort((a, b) => b.score - a.score);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto rounded-xl border border-border bg-surface p-3 shadow-[var(--shadow-card)]">
      <p className="text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-accent">
        Live stand
      </p>
      <p className="mt-1 text-xs text-muted">Scores in deze lobby</p>
      <ol className="mt-2 flex flex-col gap-1">
        {sorted.map((player, index) => {
          const rank = index + 1;
          const yours = player.userId === currentUserId;
          const streak = player.currentStreak ?? 0;
          return (
            <li
              key={player.userId}
              className={`flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm ${
                yours
                  ? "bg-accent-muted/50 ring-1 ring-accent/30"
                  : rank <= 3
                    ? "bg-surface-elevated"
                    : "bg-surface-elevated/80"
              }`}
            >
              <span className="w-5 shrink-0 font-mono text-xs font-semibold tabular-nums text-muted">
                {rank}
              </span>
              <span className="min-w-0 flex-1 truncate">
                <span className="font-medium">{player.username}</span>
                {streak > 0 ? (
                  <span className="ml-1 text-xs text-competition">{streak}×</span>
                ) : null}
              </span>
              <span className="shrink-0 font-mono font-semibold tabular-nums">
                {player.score}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
