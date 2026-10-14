/** Aan het einde van de ingestelde tijd is een SET nog 40% waard (tussen 30 en 50%). */
export const CLASSIC_LATE_POINT_FACTOR = 0.4;

export function classicElapsedPointFactor(
  startedAt: string,
  timeLimitSeconds: number | null,
  nowMs: number,
): number {
  if (!timeLimitSeconds || timeLimitSeconds <= 0) return 1;
  const started = Date.parse(startedAt);
  if (!Number.isFinite(started)) return 1;
  const ratio = Math.min(1, Math.max(0, (nowMs - started) / (timeLimitSeconds * 1000)));
  return 1 - (1 - CLASSIC_LATE_POINT_FACTOR) * ratio;
}

export function classicPointsForSet(
  fullPoints: number,
  startedAt: string,
  timeLimitSeconds: number | null,
  nowMs: number,
): number {
  const factor = classicElapsedPointFactor(startedAt, timeLimitSeconds, nowMs);
  if (factor >= 1) return fullPoints;
  return Math.max(1, Math.round(fullPoints * factor));
}
