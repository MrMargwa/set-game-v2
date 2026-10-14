export type PlayStatTileProps = {
  label: string;
  value: string | number;
  icon: string;
  tone?: "default" | "competition" | "urgent" | "streak";
  testId?: string;
  hint?: string;
};

export function PlayStatTile({
  label,
  value,
  icon,
  tone = "default",
  testId,
  hint,
}: PlayStatTileProps) {
  const toneClass =
    tone === "urgent"
      ? "border-competition-urgent/40 bg-danger-bg text-competition-urgent"
      : tone === "competition"
        ? "border-competition/35 bg-competition/10 text-competition"
        : tone === "streak"
          ? "border-competition/30 bg-competition/10 text-foreground"
          : "border-border bg-surface text-foreground";

  return (
    <div
      className={`min-w-0 rounded-lg border px-2 py-1.5 shadow-[var(--shadow-card)] ${toneClass}`}
    >
      <div className="flex items-center gap-1 text-[0.6rem] font-medium uppercase tracking-[0.08em] text-muted">
        <span aria-hidden>{icon}</span>
        <span className="truncate">{label}</span>
      </div>
      <p
        className="mt-0.5 truncate font-mono text-base font-semibold leading-none tabular-nums lg:text-xl"
        data-testid={testId}
      >
        {value}
      </p>
      {hint ? (
        <p className="mt-1 truncate text-[0.65rem] text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function formatPlayElapsed(ms: number): string {
  const clamped = Math.max(0, ms);
  const totalSeconds = Math.floor(clamped / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const tenths = Math.floor((clamped % 1000) / 100);
  return `${minutes}:${seconds.toString().padStart(2, "0")}.${tenths}`;
}
