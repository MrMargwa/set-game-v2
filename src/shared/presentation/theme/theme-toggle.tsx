"use client";

import { useSyncExternalStore } from "react";
import { THEME_PREFERENCES, type ThemePreference } from "./constants";
import {
  getThemePreferenceServerSnapshot,
  getThemePreferenceSnapshot,
  setThemePreference,
  subscribeThemePreference,
} from "./theme-client";

const LABELS: Record<ThemePreference, string> = {
  light: "Licht",
  dark: "Donker",
  system: "Systeem",
};

export function ThemeToggle() {
  const preference = useSyncExternalStore(
    subscribeThemePreference,
    getThemePreferenceSnapshot,
    getThemePreferenceServerSnapshot,
  );

  return (
    <div
      className="flex rounded-lg border border-border bg-surface p-0.5"
      role="group"
      aria-label="Thema"
    >
      {THEME_PREFERENCES.map((pref) => (
        <button
          key={pref}
          type="button"
          onClick={() => setThemePreference(pref)}
          className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
            preference === pref
              ? "bg-accent text-accent-foreground"
              : "text-muted hover:text-foreground"
          }`}
        >
          {LABELS[pref]}
        </button>
      ))}
    </div>
  );
}
