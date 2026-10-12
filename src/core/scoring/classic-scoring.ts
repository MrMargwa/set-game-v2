import type { ClassicGameConfig } from "../game-engine/types";

/**
 * Punten voor de N-de SET op rij (index 0 = streak 1).
 * Bewust ongelijke bedragen; streak 6 en hoger blijft op de laatste waarde.
 */
export const CLASSIC_COMBO_POINTS = [1224, 2356, 5167, 6543, 9512, 13789] as const;

export type SetScore = {
  points: number;
  multiplier: number;
};

export function comboPointsForStreak(streak: number): number {
  if (streak <= 0) {
    return CLASSIC_COMBO_POINTS[0];
  }
  const index = Math.min(streak, CLASSIC_COMBO_POINTS.length) - 1;
  return CLASSIC_COMBO_POINTS[index] ?? CLASSIC_COMBO_POINTS[CLASSIC_COMBO_POINTS.length - 1];
}

export function pointsForValidSet(
  config: ClassicGameConfig,
  streakAfterSet: number,
): SetScore {
  if (!config.comboScoring) {
    return { points: config.pointsPerSet, multiplier: 1 };
  }

  return {
    points: comboPointsForStreak(streakAfterSet),
    multiplier: 1,
  };
}
