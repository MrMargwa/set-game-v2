import Link from "next/link";
import { HomeHeroShowcase } from "@/modules/games/presentation/home-hero-showcase";
import { HomeModeCard } from "@/modules/games/presentation/home-mode-card";
import {
  MULTIPLAYER_LOBBY_ENABLED,
  TIME_ATTACK_ENABLED,
} from "@/shared/config/game-availability";
import {
  btnPrimaryPill,
  btnSecondaryPill,
} from "@/shared/presentation/ui/styles";

const modes = [
  {
    href: "/play?mode=classic",
    title: "Classic",
    eyebrow: "Solo",
    description: "Leeg het deck en bouw een combo op voor een hogere score.",
    cta: "Start Classic",
    meta: ["Score op combo", "Volledige deck", "Combo-score"],
    accent: "default" as const,
    icon: "classic" as const,
  },
  {
    href: "/play?mode=time_attack",
    title: "Time Attack",
    eyebrow: "Tegen de klok",
    description: "60 seconden — hoeveel SETs vind je onder druk?",
    cta: TIME_ATTACK_ENABLED ? "Start Time Attack" : "Binnenkort",
    meta: ["60 seconden", "−3s straf", "Hoogste score"],
    accent: "competition" as const,
    icon: "time" as const,
    comingSoon: !TIME_ATTACK_ENABLED,
  },
  {
    href: "/lobby",
    title: "Online lobby",
    eyebrow: "Multiplayer",
    description: "Speel tegelijk met anderen op hetzelfde bord.",
    cta: MULTIPLAYER_LOBBY_ENABLED ? "Naar lobby" : "Binnenkort",
    meta: ["Gedeeld bord", "Vrienden", "Invitecode"],
    accent: "default" as const,
    icon: "multiplayer" as const,
    comingSoon: !MULTIPLAYER_LOBBY_ENABLED,
  },
];

const highlights = [
  { label: "Combo-score", detail: "vanaf 100 per SET" },
  {
    label: "Time Attack",
    detail: TIME_ATTACK_ENABLED ? "60 seconden" : "Binnenkort",
  },
  {
    label: "Online lobby",
    detail: MULTIPLAYER_LOBBY_ENABLED ? "Samen spelen" : "Binnenkort",
  },
];

export default function HomePage() {
  return (
    <div className="flex w-full flex-col">
      <section className="relative border-b border-border">
        <div
          className="pointer-events-none absolute inset-0 overflow-hidden"
          aria-hidden
        >
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgb(99_102_241/0.12),transparent_55%)]" />
        </div>
        <div className="relative mx-auto w-full max-w-5xl px-4 py-8 sm:py-16">
          <div className="grid gap-10 md:grid-cols-[minmax(0,1fr)_minmax(16rem,22rem)] md:items-center md:gap-8 lg:gap-12">
            <div className="min-w-0">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">
                SET Game v2 — vernieuwd
              </p>
              <h1 className="font-display mt-3 max-w-xl text-3xl font-bold tracking-tight text-foreground min-[400px]:text-4xl sm:text-5xl sm:leading-[1.08]">
                Patronen zien.
                <span className="block text-foreground/90">SETs pakken.</span>
              </h1>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted sm:text-lg">
                Zoek SETs en bouw combo&apos;s in Classic. Time Attack en online
                lobby volgen binnenkort.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Link href="/play?mode=classic" className={`${btnPrimaryPill} w-full sm:w-auto`}>
                  Nu spelen
                </Link>
                <Link href="/leaderboards" className={`${btnSecondaryPill} w-full sm:w-auto`}>
                  Leaderboard
                </Link>
                <Link href="/dashboard" className={`${btnSecondaryPill} w-full sm:w-auto`}>
                  Dashboard
                </Link>
              </div>
              <ul className="mt-8 flex flex-wrap gap-2">
                {highlights.map((item) => (
                  <li
                    key={item.label}
                    className="rounded-full border border-border bg-surface/80 px-3 py-1.5 text-sm shadow-[var(--shadow-card)] backdrop-blur-sm"
                  >
                    <span className="font-medium text-foreground">
                      {item.label}
                    </span>
                    <span className="text-muted"> · {item.detail}</span>
                  </li>
                ))}
              </ul>
            </div>

            <HomeHeroShowcase />
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
              Speelmodi
            </p>
            <h2 className="font-display text-2xl font-bold text-foreground">
              Kies je modus
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted">
              Kies je tempo: combo&apos;s bouwen, sprinten tegen de klok, of
              samen in de lobby.
            </p>
          </div>
          <Link href="/play?mode=classic" className={`${btnSecondaryPill} w-full sm:w-auto`}>
            Direct naar tafel
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {modes.map((mode) => (
            <HomeModeCard key={mode.href} {...mode} />
          ))}
        </div>
      </section>
    </div>
  );
}
