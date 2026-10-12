export const SET_SUCCESS_CELEBRATE_MS = 520;
export const SET_SUCCESS_EXIT_MS = 220;
export const HINT_HIGHLIGHT_MS = 4500;

export function motionDurationsForSetClear(): {
  celebrate: number;
  exit: number;
} {
  if (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return { celebrate: 100, exit: 80 };
  }
  return { celebrate: SET_SUCCESS_CELEBRATE_MS, exit: SET_SUCCESS_EXIT_MS };
}
