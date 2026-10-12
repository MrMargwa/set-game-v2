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

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const preference = useSyncExternalStore(
    subscribeThemePreference,
    getThemePreferenceSnapshot,
    getThemePreferenceServerSnapshot,
  );

  return (
    <div
      className={`flex rounded-lg border border-border bg-surface p-0.5 ${className}`}
      role="group"
      aria-label="Thema"
    >
      {THEME_PREFERENCES.map((pref) => (
        <button
          key={pref}
          type="button"
          onClick={() => setThemePreference(pref)}
          className={`min-h-11 flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
            preference === pref
              ? "bg-accent text-accent-foreground"
              : "text-muted hover:text-foreground"
          }`}
          aria-pressed={preference === pref}
        >
          {LABELS[pref]}
        </button>
      ))}
    </div>
  );
}
