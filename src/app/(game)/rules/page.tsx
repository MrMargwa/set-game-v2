import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { RulesPanel } from "@/modules/games/presentation/rules/rules-panel";
import {
  parseRulesSection,
  type RulesSectionId,
} from "@/modules/games/presentation/rules/parse-rules-section";
import {
  btnSecondaryPill,
  pageLead,
  pageTitle,
} from "@/shared/presentation/ui/styles";

export const metadata: Metadata = {
  title: "Spelregels",
  description:
    "Hoe een SET werkt, en hoe je scoort in Classic, Time Attack en multiplayer.",
};

type RulesPageProps = {
  searchParams: Promise<{ mode?: string }>;
};

function resolveSection(mode: string | undefined): RulesSectionId {
  if (mode === "multiplayer") {
    return "multiplayer";
  }
  return parseRulesSection(mode);
}

export default async function RulesPage({ searchParams }: RulesPageProps) {
  const params = await searchParams;
  const section = resolveSection(params.mode);

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:gap-8 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Uitleg
          </p>
          <h1 className={`${pageTitle} mt-2 text-3xl sm:text-4xl`}>
            Spelregels
          </h1>
          <p className={`${pageLead} max-w-2xl text-base`}>
            Hoe een SET werkt, en wat je in Classic, Time Attack en multiplayer scoort.
          </p>
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
          <Link
            href="/play?mode=classic"
            className={`${btnSecondaryPill} w-full sm:w-auto`}
          >
            Nu spelen
          </Link>
        </div>
      </header>

      <Suspense
        fallback={
          <p className="text-center text-sm text-muted">Spelregels laden…</p>
        }
      >
        <RulesPanel initialSection={section} />
      </Suspense>
    </div>
  );
}
