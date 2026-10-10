/** Gedeelde Tailwind-klassen volgens UI-UX-DESIGN.md */

export const linkNav =
  "text-foreground/75 transition-colors hover:text-foreground";

export const linkAccent =
  "font-medium text-accent transition-colors hover:text-accent-hover";

export const btnPrimary =
  "inline-flex min-h-11 items-center justify-center rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50";

export const btnSecondary =
  "inline-flex min-h-11 items-center justify-center rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated disabled:cursor-not-allowed disabled:opacity-50";

export const btnCompetition =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-competition px-8 py-3 text-base font-semibold text-white shadow-[var(--shadow-card)] transition-colors hover:opacity-90";

export const btnPrimaryPill =
  "inline-flex min-h-11 items-center justify-center rounded-full bg-accent px-8 py-3 text-base font-semibold text-accent-foreground shadow-[var(--shadow-card)] transition-colors hover:bg-accent-hover";

export const btnSecondaryPill =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-border bg-surface px-8 py-3 text-base font-semibold text-foreground transition-colors hover:bg-surface-elevated";

export const pillActive =
  "rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground";

export const pillInactive =
  "rounded-full border border-border px-3 py-1 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated";

export const panel =
  "rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]";

export const alertDanger =
  "rounded-lg bg-danger-bg px-4 py-2 text-sm text-danger";

export const alertSuccess =
  "rounded-lg bg-success-bg px-4 py-2 text-sm text-success";

export const inputField =
  "mt-1 w-full rounded-lg border border-border bg-surface px-3 py-2 text-foreground transition-shadow focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export const statLabel = "text-sm text-muted";

export const statValue =
  "font-mono text-2xl font-semibold tabular-nums text-foreground";

export const pageTitle =
  "font-display text-2xl font-bold tracking-tight text-foreground";

export const pageLead = "mt-2 text-sm text-muted";

export const endedPanel =
  "rounded-xl border border-accent-muted bg-accent-muted/30 p-6 text-center";
