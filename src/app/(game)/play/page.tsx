import { Suspense } from "react";
import type { Metadata } from "next";
import { parseGameModeId } from "@/core/game-modes";
import { ComingSoonPanel } from "@/modules/games/presentation/coming-soon-panel";
import { GameBoard } from "@/modules/games/presentation/game-board";
import { isGameModePlayable } from "@/shared/config/game-availability";

export const metadata: Metadata = { title: "Spelen" };

type PlayPageProps = {
  searchParams: Promise<{ seed?: string; mode?: string }>;
};

export default async function PlayPage({ searchParams }: PlayPageProps) {
  const { seed, mode } = await searchParams;
  const modeId = parseGameModeId(mode);
  const initialSeed = seed ?? `${modeId}-opening-table`;

  if (!isGameModePlayable(modeId)) {
    return <ComingSoonPanel feature="time_attack" />;
  }

  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">Spel laden…</p>}>
      <GameBoard
        key={`${modeId}-${initialSeed}`}
        modeId={modeId}
        initialSeed={initialSeed}
      />
    </Suspense>
  );
}
