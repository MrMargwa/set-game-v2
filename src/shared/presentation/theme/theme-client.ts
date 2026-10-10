import { THEME_STORAGE_KEY, type ThemePreference } from "./constants";

const listeners = new Set<() => void>();

function readPreference(): ThemePreference {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored === "dark" || stored === "system") return stored;
  return "light";
}

export function resolveDark(pref: ThemePreference): boolean {
  if (pref === "dark") return true;
  if (pref === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(pref: ThemePreference) {
  const dark = resolveDark(pref);
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(dark ? "dark" : "light");
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function setThemePreference(pref: ThemePreference) {
  localStorage.setItem(THEME_STORAGE_KEY, pref);
  applyTheme(pref);
  notify();
}

export function subscribeThemePreference(callback: () => void) {
  listeners.add(callback);

  const onStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) callback();
  };
  window.addEventListener("storage", onStorage);

  const mq = window.matchMedia("(prefers-color-scheme: dark)");
  const onMq = () => {
    if (readPreference() === "system") {
      applyTheme("system");
      callback();
    }
  };
  mq.addEventListener("change", onMq);

  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", onStorage);
    mq.removeEventListener("change", onMq);
  };
}

export function getThemePreferenceSnapshot(): ThemePreference {
  return readPreference();
}

export function getThemePreferenceServerSnapshot(): ThemePreference {
  return "light";
}
