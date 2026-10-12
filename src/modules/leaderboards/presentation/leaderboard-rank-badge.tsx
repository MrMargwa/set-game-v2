type LeaderboardRankBadgeProps = {
  rank: number;
  size?: "sm" | "md";
};

const podiumStyles: Record<1 | 2 | 3, string> = {
  1: "border-leaderboard-gold-fg/25 bg-leaderboard-gold-bg text-leaderboard-gold-fg",
  2: "border-leaderboard-silver-fg/25 bg-leaderboard-silver-bg text-leaderboard-silver-fg",
  3: "border-leaderboard-bronze-fg/25 bg-leaderboard-bronze-bg text-leaderboard-bronze-fg",
};

export function LeaderboardRankBadge({
  rank,
  size = "sm",
}: LeaderboardRankBadgeProps) {
  const sizeClass =
    size === "md"
      ? "size-10 text-base"
      : "size-8 text-sm";

  if (rank >= 1 && rank <= 3) {
    const shell = podiumStyles[rank as 1 | 2 | 3];
    return (
      <span
        className={`inline-grid shrink-0 place-items-center rounded-full border font-mono font-semibold tabular-nums ${sizeClass} ${shell}`}
        aria-label={`Plaats ${rank}`}
      >
        {rank}
      </span>
    );
  }

  return (
    <span
      className={`inline-grid shrink-0 place-items-center rounded-full border border-border bg-surface-elevated font-mono font-semibold tabular-nums text-muted ${sizeClass}`}
    >
      {rank}
    </span>
  );
}
