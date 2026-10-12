import Link from "next/link";
import {
  IconModeClassic,
  IconModeMultiplayer,
  IconModeTime,
} from "@/shared/presentation/ui/mode-icons";
import { ComingSoonBadge } from "@/shared/presentation/ui/coming-soon-badge";

type ModeIcon = "classic" | "time" | "multiplayer";

type HomeModeCardProps = {
  href: string;
  title: string;
  eyebrow: string;
  description: string;
  cta: string;
  meta: string[];
  icon: ModeIcon;
  accent?: "default" | "competition";
  comingSoon?: boolean;
};

function ModeEmblem({
  icon,
  accent,
}: {
  icon: ModeIcon;
  accent: "default" | "competition";
}) {
  const shellClass =
    accent === "competition"
      ? "border-competition/35 bg-gradient-to-br from-competition/15 to-competition/5 text-competition shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]"
      : "border-accent/30 bg-gradient-to-br from-accent-muted/70 to-surface text-accent shadow-[inset_0_1px_0_rgb(255_255_255/0.5)]";

  const Icon =
    icon === "classic"
      ? IconModeClassic
      : icon === "time"
        ? IconModeTime
        : IconModeMultiplayer;

  return (
    <div
      className={`grid size-[4.25rem] shrink-0 place-items-center rounded-2xl border ${shellClass}`}
      aria-hidden
    >
      <Icon className="size-8" />
    </div>
  );
}

export function HomeModeCard({
  href,
  title,
  eyebrow,
  description,
  cta,
  meta,
  icon,
  accent = "default",
  comingSoon = false,
}: HomeModeCardProps) {
  const ctaClass =
    accent === "competition"
      ? "bg-competition text-white hover:bg-competition/90"
      : "bg-accent text-accent-foreground hover:bg-accent-hover";

  const disabledCtaClass =
    "cursor-not-allowed border border-border bg-surface-elevated text-muted";

  return (
    <article
      className={`relative flex flex-col overflow-hidden rounded-2xl border bg-surface shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-[var(--motion-normal)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 lg:min-h-[17.5rem] ${
        comingSoon
          ? "border-border/80 opacity-[0.92]"
          : "border-border hover:-translate-y-0.5 hover:border-ring/40 hover:shadow-[var(--shadow-card-hover)]"
      }`}
    >
      {comingSoon ? (
        <div className="absolute right-4 top-4 z-[1]">
          <ComingSoonBadge />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start gap-4">
          <ModeEmblem icon={icon} accent={accent} />
          <div className="min-w-0 flex-1 pt-0.5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
              {eyebrow}
            </p>
            <h2 className="font-display mt-1 text-xl font-semibold tracking-tight text-foreground">
              {title}
            </h2>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">{description}</p>
        <ul className="mt-5 flex flex-wrap gap-2">
          {meta.map((item) => (
            <li key={item}>
              <span
                className="inline-block rounded-full border border-border bg-surface-elevated px-2.5 py-1 text-xs font-medium text-foreground/85"
              >
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div className="border-t border-border bg-surface-elevated/60 px-4 py-3">
        {comingSoon ? (
          <span
            className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold ${disabledCtaClass}`}
            aria-disabled="true"
          >
            {cta}
          </span>
        ) : (
          <Link
            href={href}
            className={`inline-flex min-h-11 w-full items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${ctaClass}`}
          >
            {cta}
          </Link>
        )}
      </div>
    </article>
  );
}
