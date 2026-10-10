import { Suspense } from "react";
import { parseGameModeId } from "@/core/game-modes";
import { GameBoard } from "@/modules/games/presentation/game-board";

type PlayPageProps = {
  searchParams: Promise<{ seed?: string; mode?: string }>;
};

export default async function PlayPage({ searchParams }: PlayPageProps) {
  const { seed, mode } = await searchParams;
  const modeId = parseGameModeId(mode);

  return (
    <Suspense fallback={<p className="p-8 text-center text-muted">Spel laden…</p>}>
      <GameBoard
        key={`${modeId}-${seed ?? "random"}`}
        modeId={modeId}
        initialSeed={seed}
      />
    </Suspense>
  );
}
