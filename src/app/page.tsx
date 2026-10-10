import Link from "next/link";
import {
  btnCompetition,
  btnPrimaryPill,
  btnSecondaryPill,
  panel,
} from "@/shared/presentation/ui/styles";

const modes = [
  {
    href: "/play?mode=classic",
    title: "Classic SET",
    description: "Rustig tempo, zoek SETs op het bord tot het deck op is.",
    cta: "Start Classic",
    ctaClass: btnPrimaryPill,
  },
  {
    href: "/play?mode=time_attack",
    title: "Time Attack",
    description: "60 seconden — hoeveel SETs scoor jij onder druk?",
    cta: "Start Time Attack",
    ctaClass: btnCompetition,
  },
  {
    href: "/lobby",
    title: "Online lobby",
    description: "Race met vrienden in een realtime Classic-partij.",
    cta: "Naar lobby",
    ctaClass: btnSecondaryPill,
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden px-6 py-16 sm:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-40 dark:opacity-25"
          aria-hidden
          style={{
            background:
              "radial-gradient(ellipse 80% 50% at 50% -20%, var(--accent-muted), transparent)",
          }}
        />
        <div className="relative mx-auto max-w-2xl text-center">
          <p className="text-sm font-medium uppercase tracking-wider text-accent">
            SET Game v2 — renewed
          </p>
          <h1 className="font-display mt-3 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Vind de SETs. Race de klok.
          </h1>
          <p className="mt-4 text-lg text-muted">
            Classic solo, Time Attack en online multiplayer — met accounts en
            opgeslagen resultaten.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/play?mode=classic" className={btnPrimaryPill}>
              Nu spelen
            </Link>
            <Link href="/leaderboards" className={btnSecondaryPill}>
              Leaderboard
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-5xl flex-1 gap-4 px-4 pb-12 sm:grid-cols-3">
        {modes.map((mode) => (
          <article
            key={mode.href}
            className={`${panel} flex flex-col gap-4 p-6 transition-shadow hover:shadow-[var(--shadow-card-hover)]`}
          >
            <h2 className="font-display text-xl font-semibold text-foreground">
              {mode.title}
            </h2>
            <p className="flex-1 text-sm text-muted">{mode.description}</p>
            <Link href={mode.href} className={`${mode.ctaClass} w-full text-center`}>
              {mode.cta}
            </Link>
          </article>
        ))}
      </section>

      <div className="mx-auto mb-8 flex flex-wrap justify-center gap-3 px-4">
        <Link href="/dashboard" className={btnSecondaryPill}>
          Dashboard
        </Link>
      </div>
    </div>
  );
}
