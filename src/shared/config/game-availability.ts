import { parseGameModeId, type GameModeId } from "@/core/game-modes";

/** Zet op `true` zodra Time Attack klaar is voor spelers. */
export const TIME_ATTACK_ENABLED = true;

/** Zet op `true` zodra online lobby / multiplayer klaar is. */
export const MULTIPLAYER_LOBBY_ENABLED = true;

export const COMING_SOON_BADGE = "Binnenkort";

export function isGameModePlayable(modeId: GameModeId): boolean {
  if (modeId === "classic") return true;
  if (modeId === "time_attack") return TIME_ATTACK_ENABLED;
  if (modeId === "multiplayer") return MULTIPLAYER_LOBBY_ENABLED;
  return false;
}

export function isMultiplayerLobbyEnabled(): boolean {
  return MULTIPLAYER_LOBBY_ENABLED;
}

export function resolvePlayableModeId(value: string | undefined): GameModeId {
  const modeId = parseGameModeId(value);
  return isGameModePlayable(modeId) ? modeId : "classic";
}

export type ComingSoonFeatureId = "time_attack" | "multiplayer";

export const COMING_SOON_COPY: Record<
  ComingSoonFeatureId,
  { title: string; lead: string }
> = {
  time_attack: {
    title: "Time Attack",
    lead: "60 seconden, druk op het bord en strafseconden bij een foute SET. We bouwen deze modus nog af — Classic kun je nu al spelen.",
  },
  multiplayer: {
    title: "Online lobby",
    lead: "Speel realtime met vrienden via invitecode. Multiplayer komt in een volgende update; tot die tijd focussen we op een sterke solo-ervaring.",
  },
};
