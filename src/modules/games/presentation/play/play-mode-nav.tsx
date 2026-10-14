import Link from "next/link";
import type { GameModeId } from "@/core/game-modes";
import { listGameModes } from "@/core/game-modes";
import { isGameModePlayable } from "@/shared/config/game-availability";
import { ComingSoonBadge } from "@/shared/presentation/ui/coming-soon-badge";
import { pillActive, pillInactive } from "@/shared/presentation/ui/styles";

type PlayModeNavProps = {
  activeModeId: GameModeId;
};

export function PlayModeNav({ activeModeId }: PlayModeNavProps) {
  const modes = listGameModes();

  return (
    <nav className="flex flex-row flex-wrap gap-1.5 lg:flex-col" aria-label="Spelmodus">
      {modes.map((mode) => {
        if (!isGameModePlayable(mode.id)) {
          return (
            <span
              key={mode.id}
              className={`${pillInactive} flex min-w-0 flex-1 cursor-not-allowed flex-col items-center justify-center gap-0.5 !rounded-lg !px-2 !py-1.5 !text-[0.8rem] opacity-80 sm:flex-row sm:gap-1 lg:w-full lg:flex-none`}
              title="Binnenkort beschikbaar"
            >
              <span className="text-center leading-tight">{mode.displayName}</span>
              <ComingSoonBadge className="!px-1.5 !py-0 !text-[0.55rem]" />
            </span>
          );
        }
        return (
          <Link
            key={mode.id}
            href={`/play?mode=${mode.id}`}
            className={`${
              mode.id === activeModeId ? pillActive : pillInactive
            } min-w-0 flex-1 !rounded-lg !px-2.5 !py-2 !text-[0.8rem] lg:w-full lg:flex-none`}
            aria-current={mode.id === activeModeId ? "page" : undefined}
          >
            {mode.displayName}
          </Link>
        );
      })}
    </nav>
  );
}
