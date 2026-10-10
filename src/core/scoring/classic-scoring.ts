import type { ClassicGameConfig } from "../game-engine/types";

export function pointsForValidSet(config: ClassicGameConfig): number {
  return config.pointsPerSet;
}
