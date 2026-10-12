import { COMING_SOON_BADGE } from "@/shared/config/game-availability";

type ComingSoonBadgeProps = {
  className?: string;
};

export function ComingSoonBadge({ className = "" }: ComingSoonBadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border border-border bg-surface-elevated px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-muted ${className}`}
    >
      {COMING_SOON_BADGE}
    </span>
  );
}
