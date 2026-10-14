/** Gedeelde Tailwind-klassen volgens UI-UX-DESIGN.md */

const focusRing =
  "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export const linkNav =
  "rounded-sm text-foreground/75 transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const linkAccent =
  "font-medium text-accent transition-colors hover:text-accent-hover";

export const btnPrimary =
  `inline-flex min-h-11 touch-manipulation items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const btnSecondary =
  `inline-flex min-h-11 touch-manipulation items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`;

export const btnCompetition =
  `inline-flex min-h-11 touch-manipulation items-center justify-center rounded-full bg-competition px-8 py-3 text-base font-semibold text-white shadow-[var(--shadow-card)] transition-colors hover:opacity-90 ${focusRing}`;

export const btnPrimaryPill =
  `inline-flex min-h-11 touch-manipulation items-center justify-center rounded-full bg-accent px-8 py-3 text-base font-semibold text-accent-foreground shadow-[var(--shadow-card)] transition-colors hover:bg-accent-hover ${focusRing}`;

export const btnSecondaryPill =
  `inline-flex min-h-11 touch-manipulation items-center justify-center rounded-full border border-border bg-surface px-8 py-3 text-base font-semibold text-foreground transition-colors hover:bg-surface-elevated ${focusRing}`;

export const pillActive =
  `inline-flex min-h-11 touch-manipulation items-center justify-center whitespace-nowrap rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground ${focusRing}`;

export const pillInactive =
  `inline-flex min-h-11 touch-manipulation items-center justify-center whitespace-nowrap rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated ${focusRing}`;

export const modeTabActive =
  `inline-flex min-h-10 flex-1 touch-manipulation items-center justify-center rounded-lg bg-accent px-3 text-sm font-semibold text-accent-foreground shadow-[var(--shadow-card)] ${focusRing}`;

export const modeTabInactive =
  `inline-flex min-h-10 flex-1 touch-manipulation items-center justify-center rounded-lg border border-border bg-surface px-3 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated ${focusRing}`;

export const modeTabDisabled =
  `inline-flex min-h-10 flex-1 cursor-not-allowed items-center justify-center gap-1 rounded-lg border border-border bg-surface-elevated/80 px-2 text-sm font-medium text-muted opacity-90`;

export const panel =
  "rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]";

export const alertDanger =
  "rounded-lg bg-danger-bg px-4 py-2 text-sm text-danger";

export const alertSuccess =
  "rounded-lg bg-success-bg px-4 py-2 text-sm text-success";

export const inputField =
  "mt-1 min-h-11 w-full rounded-lg border border-border bg-surface px-3 py-2 text-base text-foreground transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const statLabel = "text-sm text-muted";

export const statValue =
  "font-mono text-2xl font-semibold tabular-nums text-foreground";

export const pageTitle =
  "font-display text-2xl font-bold tracking-tight text-foreground";

export const pageLead = "mt-2 text-sm text-muted";

export const endedPanel =
  "rounded-xl border border-accent-muted bg-accent-muted/30 p-6 text-center";
