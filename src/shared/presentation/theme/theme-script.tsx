import { THEME_STORAGE_KEY } from "./constants";

const script = `
(function () {
  var key = "${THEME_STORAGE_KEY}";
  var stored = localStorage.getItem(key);
  var pref = stored === "dark" || stored === "system" ? stored : "light";
  var dark =
    pref === "dark" ||
    (pref === "system" &&
      window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(dark ? "dark" : "light");
})();
`;

export function ThemeScript() {
  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
