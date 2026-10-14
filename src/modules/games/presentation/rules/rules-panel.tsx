"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import {
  CLASSIC_DEAL_EXTRA_COST,
  CLASSIC_HINT_COST,
  CLASSIC_POINTS_PER_SET,
} from "@/core/game-engine/types";
import { CLASSIC_COMBO_POINTS } from "@/core/scoring/classic-scoring";
import { DEFAULT_TIME_ATTACK_CONFIG } from "@/core/game-modes/time-attack/types";
import {
  COMING_SOON_BADGE,
  isGameModePlayable,
  TIME_ATTACK_ENABLED,
} from "@/shared/config/game-availability";
import { ComingSoonBadge } from "@/shared/presentation/ui/coming-soon-badge";
import {
  btnPrimaryPill,
  linkAccent,
  modeTabActive,
  modeTabInactive,
  panel,
  pillInactive,
} from "@/shared/presentation/ui/styles";
import { parseRulesSection, type RulesSectionId } from "./parse-rules-section";
import { RulesSetShowcase } from "./rules-set-showcase";

type RulesPanelProps = {
  initialSection: RulesSectionId;
};

function sectionFromModeParam(mode: string | null): RulesSectionId {
  if (!mode) {
    return "basis";
  }
  if (mode === "multiplayer") {
    return "multiplayer";
  }
  return parseRulesSection(mode);
}

const sections: { id: RulesSectionId; label: string }[] = [
  { id: "basis", label: "De basis" },
  { id: "classic", label: "Classic" },
  { id: "time_attack", label: "Time Attack" },
  { id: "multiplayer", label: "Multiplayer" },
];

function RuleRow({
  term,
  detail,
}: {
  term: string;
  detail: string;
}) {
  return (
    <div className="flex flex-col gap-1 border-b border-border px-4 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6 sm:px-5">
      <dt className="text-sm font-medium text-foreground">{term}</dt>
      <dd className="text-sm leading-relaxed text-muted sm:max-w-md sm:text-right">
        {detail}
      </dd>
    </div>
  );
}

function SectionIntro({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className={`${panel} overflow-hidden`}>
      <div className="border-b border-border bg-surface-elevated/80 px-4 py-4 sm:px-5">
        <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="px-4 py-4 text-sm leading-relaxed text-muted sm:px-5">
        {children}
      </div>
    </div>
  );
}

export function RulesPanel({ initialSection }: RulesPanelProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const section =
    searchParams.get("mode") === null
      ? initialSection
      : sectionFromModeParam(searchParams.get("mode"));

  function selectSection(id: RulesSectionId) {
    const params = new URLSearchParams();
    if (id !== "basis") {
      params.set("mode", id);
    }
    const query = params.toString();
    router.replace(query ? `/rules?${query}` : "/rules", { scroll: false });
  }

  const timeAttackDurationSec = Math.round(
    DEFAULT_TIME_ATTACK_CONFIG.durationMs / 1000,
  );
  const timeAttackPenaltySec = Math.round(
    DEFAULT_TIME_ATTACK_CONFIG.invalidSetPenaltyMs / 1000,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className={`${panel} overflow-hidden`}>
        <div className="border-b border-border bg-surface-elevated/80 px-4 py-4 sm:px-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Onderdelen
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
            {sections.map((item) => {
              const active = section === item.id;
              const showSoon =
                item.id === "time_attack" && !TIME_ATTACK_ENABLED;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectSection(item.id)}
                  className={`sm:flex-none ${
                    active ? modeTabActive : modeTabInactive
                  } ${showSoon ? "gap-1.5" : ""}`}
                  aria-current={active ? "true" : undefined}
                >
                  <span className="truncate">{item.label}</span>
                  {showSoon ? (
                    <ComingSoonBadge className="hidden shrink-0 min-[420px]:inline-flex" />
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>
        <p className="px-4 py-3 text-sm text-muted sm:px-5">
          De SET-regels zijn in elke modus hetzelfde. Scoring en tempo verschillen.
          Hoe een SET werkt, staat onder{" "}
          <button
            type="button"
            onClick={() => selectSection("basis")}
            className={linkAccent}
          >
            De basis
          </button>
          .
        </p>
      </div>

      {section === "basis" ? (
        <>
          <SectionIntro title="Wat is een SET?">
            <p>
              Op het bord liggen kaarten met vier kenmerken:{" "}
              <strong className="font-medium text-foreground">aantal</strong>,{" "}
              <strong className="font-medium text-foreground">vorm</strong>,{" "}
              <strong className="font-medium text-foreground">vulling</strong> en{" "}
              <strong className="font-medium text-foreground">kleur</strong>.
              Een SET is precies{" "}
              <strong className="font-medium text-foreground">drie kaarten</strong>{" "}
              waarvoor geldt: per kenmerk zijn de drie waarden óf{" "}
              <strong className="font-medium text-foreground">allemaal hetzelfde</strong>, óf{" "}
              <strong className="font-medium text-foreground">allemaal verschillend</strong>.
              Twee hetzelfde en één anders? Dan is het geen SET.
            </p>
          </SectionIntro>

          <div className={`${panel} overflow-hidden`}>
            <div className="border-b border-border bg-surface-elevated/80 px-4 py-4 sm:px-5">
              <h2 className="font-display text-xl font-bold text-foreground">
                Alle kenmerken &amp; waarden
              </h2>
              <p className="mt-2 text-sm text-muted">
                Er zijn{" "}
                <span className="font-medium text-foreground">81 kaarten</span>.
                Elke combinatie van aantal, vorm, vulling en kleur komt één keer voor.
              </p>
            </div>
            <dl className="divide-y divide-border">
              <RuleRow
                term="Aantal"
                detail="1, 2 of 3 symbolen op de kaart"
              />
              <RuleRow
                term="Vorm"
                detail="Ruit, golf of ovaal"
              />
              <RuleRow
                term="Vulling"
                detail="Gevuld, gestreept of open (alleen omtrek)"
              />
              <RuleRow
                term="Kleur"
                detail="Rood, groen of paars"
              />
            </dl>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <RulesSetShowcase
              title="Voorbeeld: alles verschillend"
              lead="Per kenmerk zie je drie verschillende waarden — een klassieke SET."
              variant="valid"
              cards={[
                {
                  number: 1,
                  color: "red",
                  shape: "oval",
                  shading: "solid",
                },
                {
                  number: 2,
                  color: "green",
                  shape: "squiggle",
                  shading: "striped",
                },
                {
                  number: 3,
                  color: "purple",
                  shape: "diamond",
                  shading: "open",
                },
              ]}
              footnote="Aantal 1-2-3, kleur rood-groen-paars, vorm ovaal-golf-ruit, vulling gevuld-gestreept-open."
            />
            <RulesSetShowcase
              title="Voorbeeld: één kenmerk gelijk"
              lead="Alle drie hebben twee symbolen. Vorm, vulling en kleur zijn overal verschillend."
              variant="valid"
              cards={[
                {
                  number: 2,
                  color: "red",
                  shape: "diamond",
                  shading: "open",
                },
                {
                  number: 2,
                  color: "green",
                  shape: "oval",
                  shading: "striped",
                },
                {
                  number: 2,
                  color: "purple",
                  shape: "squiggle",
                  shading: "solid",
                },
              ]}
            />
            <RulesSetShowcase
              title="Voorbeeld: alles gelijk per kenmerk"
              lead="Aantal, vorm, vulling en kleur zijn op alle drie de kaarten gelijk. Ook dat is een SET."
              variant="valid"
              cards={[
                {
                  number: 1,
                  color: "green",
                  shape: "squiggle",
                  shading: "striped",
                },
                {
                  number: 1,
                  color: "green",
                  shape: "squiggle",
                  shading: "striped",
                },
                {
                  number: 1,
                  color: "green",
                  shape: "squiggle",
                  shading: "striped",
                },
              ]}
              footnote="In het deck bestaat elke kaart één keer. Dit voorbeeld laat alleen de regel zien."
            />
            <RulesSetShowcase
              title="Geen SET: twee gelijk, één anders"
              lead="Bij het aantal: twee kaarten met 1 symbool en één met 2 — dat mag niet."
              variant="invalid"
              cards={[
                {
                  number: 1,
                  color: "red",
                  shape: "oval",
                  shading: "solid",
                },
                {
                  number: 1,
                  color: "green",
                  shape: "oval",
                  shading: "striped",
                },
                {
                  number: 2,
                  color: "purple",
                  shape: "oval",
                  shading: "open",
                },
              ]}
            />
          </div>

          <SectionIntro title="Spelen op het bord">
            <ul className="list-disc space-y-2 pl-5">
              <li>
                Kies drie kaarten. Is het een SET, dan gaan ze van het bord en
                komen er nieuwe uit het deck.
              </li>
              <li>
                Er liggen{" "}
                <span className="font-medium text-foreground">12 kaarten</span>{" "}
                open. De andere{" "}
                <span className="font-medium text-foreground">69</span> zitten in
                het deck.
              </li>
              <li>
                In solo mag je 5 keer 3 kaarten extra leggen, ook als er nog een
                SET ligt. De score mag onder 0. In multiplayer bepaalt de host
                of extra kaarten mogen, en alleen als er geen SET op het bord
                ligt.
              </li>
            </ul>
          </SectionIntro>
        </>
      ) : null}

      {section === "classic" ? (
        <>
          <SectionIntro title="Classic — solo">
            <p>
              Zoek SETs en houd je punten in de gaten. De speeltijd laat zien hoe
              lang je bezig bent. Hij telt niet mee voor je score.
            </p>
          </SectionIntro>

          <div className={`${panel} overflow-hidden`}>
            <div className="border-b border-border bg-surface-elevated/80 px-4 py-4 sm:px-5">
              <h2 className="font-display text-xl font-bold text-foreground">
                Score &amp; kosten
              </h2>
            </div>
            <dl>
              <RuleRow
                term="Geldige SET"
                detail={`+${CLASSIC_POINTS_PER_SET} punten per SET`}
              />
              <RuleRow
                term="Toon een SET"
                detail={`−${CLASSIC_HINT_COST} punten, ook als je score daardoor onder 0 gaat. De drie kaarten lichten op.`}
              />
              <RuleRow
                term="+3 kaarten"
                detail={`−${CLASSIC_DEAL_EXTRA_COST} punten, maximaal 5 keer. Mag ook als er nog een SET op het bord ligt. De score mag onder 0.`}
              />
              <RuleRow
                term="Foute SET"
                detail="Kost geen punten. De drie kaarten tellen niet als SET."
              />
            </dl>
          </div>

          <div className={`${panel} overflow-hidden`}>
            <div className="border-b border-border bg-surface-elevated/80 px-4 py-4 sm:px-5">
              <h2 className="font-display text-xl font-bold text-foreground">
                Tijd en het einde
              </h2>
            </div>
            <dl>
              <RuleRow
                term="Start"
                detail="De speeltijd begint pas als je op Start het spel drukt."
              />
              <RuleRow
                term="Stoppen"
                detail="Stopt het spel. Ben je ingelogd, dan komt je score op het leaderboard."
              />
              <RuleRow
                term="Deck leeg"
                detail="Het spel stopt als het bord leeg is en het deck op is."
              />
              <RuleRow
                term="Geen SET meer"
                detail="Het spel stopt als er geen SET ligt en er niet genoeg kaarten zijn om bij te leggen."
              />
            </dl>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/play?mode=classic"
              className={btnPrimaryPill}
            >
              Classic spelen
            </Link>
            <Link href="/leaderboards?mode=classic" className={pillInactive}>
              Leaderboard Classic
            </Link>
          </div>
        </>
      ) : null}

      {section === "time_attack" ? (
        <>
          <SectionIntro title="Time Attack — tegen de klok">
            <p>
              Je hebt{" "}
              <span className="font-medium text-foreground">
                {timeAttackDurationSec} seconden
              </span>{" "}
              om zoveel mogelijk SETs te vinden. Elke geldige SET is{" "}
              <span className="font-medium text-foreground">
                {DEFAULT_TIME_ATTACK_CONFIG.pointsPerSet} punt
              </span>
              .
              {!TIME_ATTACK_ENABLED ? (
                <>
                  {" "}
                  Time Attack is nog niet speelbaar. Zo werkt de modus zodra hij
                  open is.
                </>
              ) : null}
            </p>
          </SectionIntro>

          <div className={`${panel} overflow-hidden`}>
            <div className="border-b border-border bg-surface-elevated/80 px-4 py-4 sm:px-5">
              <h2 className="font-display text-xl font-bold text-foreground">
                Score en tijd
              </h2>
            </div>
            <dl>
              <RuleRow
                term="Geldige SET"
                detail={`+${DEFAULT_TIME_ATTACK_CONFIG.pointsPerSet} punt`}
              />
              <RuleRow
                term="Foute SET"
                detail={`${timeAttackPenaltySec} seconden van de resterende tijd af`}
              />
              <RuleRow
                term="Reeks"
                detail="Telt SETs die je achter elkaar vindt. Bij een fout gaat de reeks terug naar 0. Je score blijft 1 punt per geldige SET."
              />
              <RuleRow
                term="Toon een SET"
                detail="Kost geen punten. De drie kaarten lichten op."
              />
              <RuleRow
                term="+3 kaarten"
                detail="Kost geen punten. Maximaal 5 keer, ook als er nog een SET op het bord ligt."
              />
              <RuleRow
                term="Einde"
                detail="Als de tijd op 0 staat, ook meteen na een foute SET die de laatste seconden kost. Het spel stopt ook als er geen SET en geen kaarten meer zijn."
              />
            </dl>
          </div>

          <div className="flex flex-wrap gap-2">
            {isGameModePlayable("time_attack") ? (
              <Link href="/play?mode=time_attack" className={btnPrimaryPill}>
                Time Attack spelen
              </Link>
            ) : (
              <span className={`${pillInactive} cursor-not-allowed opacity-80`}>
                Time Attack — {COMING_SOON_BADGE}
              </span>
            )}
            <Link href="/leaderboards?mode=time_attack" className={pillInactive}>
              Leaderboard Time Attack
            </Link>
          </div>
        </>
      ) : null}

      {section === "multiplayer" ? (
        <>
          <SectionIntro title="Online lobby">
            <p>
              Twee of meer spelers delen hetzelfde bord. Elke geldige SET die jij
              vindt, telt mee voor jouw reeks. Hoe langer die reeks, hoe meer
              punten die SET waard is. Een foute poging zet alleen jouw reeks
              terug naar 0.
            </p>
          </SectionIntro>

          <div className={`${panel} overflow-hidden`}>
            <div className="border-b border-border bg-surface-elevated/80 px-4 py-4 sm:px-5">
              <h2 className="font-display text-xl font-bold text-foreground">
                Punten bij een reeks
              </h2>
              <p className="mt-2 text-sm text-muted">
                De punten in de tabel gelden voor de SET die je net hebt
                gevonden. Een foute poging zet alleen jouw reeks terug naar 0.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[16rem] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-surface-elevated/50">
                    <th className="px-4 py-3 font-semibold text-foreground sm:px-5">
                      SETs op rij
                    </th>
                    <th className="px-4 py-3 font-semibold text-foreground sm:px-5">
                      Punten voor die SET
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {CLASSIC_COMBO_POINTS.map((points, index) => {
                    const streak = index + 1;
                    const isMax = index === CLASSIC_COMBO_POINTS.length - 1;
                    return (
                      <tr
                        key={streak}
                        className="border-b border-border last:border-b-0"
                      >
                        <td className="px-4 py-3 text-muted sm:px-5">
                          {isMax ? `${streak}+` : streak}
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold tabular-nums text-foreground sm:px-5">
                          {points}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="border-t border-border px-4 py-3 text-sm text-muted sm:px-5">
              Vanaf {CLASSIC_COMBO_POINTS.length} SETs op rij blijft elke volgende
              SET{" "}
              <span className="font-mono font-medium text-foreground">
                {CLASSIC_COMBO_POINTS[CLASSIC_COMBO_POINTS.length - 1]}
              </span>{" "}
              punten waard.
            </p>
          </div>

          <div className={`${panel} overflow-hidden`}>
            <div className="border-b border-border bg-surface-elevated/80 px-4 py-4 sm:px-5">
              <h2 className="font-display text-xl font-bold text-foreground">
                Lobby &amp; spelverloop
              </h2>
            </div>
            <dl>
              <RuleRow
                term="Starten"
                detail="De host deelt een invitecode. Er zijn minstens twee spelers nodig."
              />
              <RuleRow
                term="Gedeeld bord"
                detail="Iedereen speelt op hetzelfde bord. De eerste geldige SET levert die speler de punten op."
              />
              <RuleRow
                term="Hints"
                detail="Geen hints in multiplayer."
              />
              <RuleRow
                term="+3 kaarten"
                detail="Alleen als er geen SET op het bord ligt. Kost geen punten."
              />
            </dl>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/lobby" className={btnPrimaryPill}>
              Naar de lobby
            </Link>
          </div>
        </>
      ) : null}
    </div>
  );
}
