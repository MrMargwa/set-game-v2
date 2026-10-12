import Link from "next/link";
import type { ComingSoonFeatureId } from "@/shared/config/game-availability";
import { COMING_SOON_COPY } from "@/shared/config/game-availability";
import {
  IconModeMultiplayer,
  IconModeTime,
} from "@/shared/presentation/ui/mode-icons";
import { ComingSoonBadge } from "@/shared/presentation/ui/coming-soon-badge";
import {
  btnPrimaryPill,
  btnSecondaryPill,
  panel,
} from "@/shared/presentation/ui/styles";

type ComingSoonPanelProps = {
  feature: ComingSoonFeatureId;
};

function FeatureIcon({ feature }: { feature: ComingSoonFeatureId }) {
  const shell =
    "grid size-16 place-items-center rounded-2xl border border-border bg-surface-elevated text-accent";
  if (feature === "time_attack") {
    return (
      <div className={`${shell} text-competition`}>
        <IconModeTime className="size-9" />
      </div>
    );
  }
  return (
    <div className={shell}>
      <IconModeMultiplayer className="size-9" />
    </div>
  );
}

export function ComingSoonPanel({ feature }: ComingSoonPanelProps) {
  const copy = COMING_SOON_COPY[feature];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col items-center px-4 py-12 sm:py-16">
      <div
        className={`${panel} w-full rounded-3xl p-8 text-center shadow-[var(--shadow-card)] sm:p-10`}
      >
        <div className="mx-auto flex w-fit flex-col items-center gap-4">
          <FeatureIcon feature={feature} />
          <ComingSoonBadge />
        </div>
        <h1 className="font-display mt-6 text-3xl font-bold tracking-tight text-foreground">
          {copy.title}
        </h1>
        <p className="mx-auto mt-3 max-w-md text-base leading-relaxed text-muted">
          {copy.lead}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/play?mode=classic" className={btnPrimaryPill}>
            Speel Classic
          </Link>
          <Link href="/" className={btnSecondaryPill}>
            Terug naar home
          </Link>
        </div>
      </div>
    </div>
  );
}
