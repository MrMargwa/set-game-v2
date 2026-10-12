import { CardSymbolStack } from "./card-symbol-stack";

const showcaseSet = [
  {
    number: 1 as const,
    color: "red" as const,
    shape: "oval" as const,
    shading: "solid" as const,
    tilt: "-rotate-3 -translate-y-0.5 sm:-rotate-6",
  },
  {
    number: 2 as const,
    color: "green" as const,
    shape: "squiggle" as const,
    shading: "striped" as const,
    tilt: "z-10",
  },
  {
    number: 3 as const,
    color: "purple" as const,
    shape: "diamond" as const,
    shading: "open" as const,
    tilt: "rotate-3 -translate-y-0.5 sm:rotate-6",
  },
];

export function HomeHeroShowcase() {
  return (
    <div
      className="relative mx-auto w-full max-w-md overflow-hidden lg:max-w-none"
      aria-hidden
    >
      <div
        className="pointer-events-none absolute -left-8 top-1/2 size-40 -translate-y-1/2 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        className="pointer-events-none absolute -right-6 top-0 size-32 rounded-full bg-competition/10 blur-3xl"
      />

      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface p-3 shadow-[var(--shadow-card)] sm:p-4">
        <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
          <div>
            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.2em] text-muted">
              Voorbeeld
            </p>
            <p className="font-display text-sm font-semibold text-foreground">
              Drie kaarten, één SET
            </p>
          </div>
          <span className="rounded-full border border-success/25 bg-success-bg px-2.5 py-1 text-xs font-semibold text-success">
            SET
          </span>
        </div>

        <div className="mt-4 flex justify-center gap-2 sm:gap-4">
          {showcaseSet.map((card, index) => (
            <div
              key={`${card.color}-${card.shape}`}
              className={`relative w-[4.6rem] min-[380px]:w-[5.5rem] sm:w-[6.25rem] ${card.tilt} animate-card-enter`}
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div
                className="aspect-[5/7] rounded-xl border-2 border-border bg-card-face p-2 shadow-[var(--shadow-card-hover)]"
              >
                <CardSymbolStack
                  number={card.number}
                  color={card.color}
                  shape={card.shape}
                  shading={card.shading}
                  symbolClassName="w-[80%] max-h-[28%] object-contain"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg border border-border bg-surface-elevated px-2 py-2">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted">
              Score
            </p>
            <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums">
              420
            </p>
          </div>
          <div className="rounded-lg border border-competition/30 bg-competition/10 px-2 py-2">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted">
              Streak
            </p>
            <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-competition">
              3×
            </p>
          </div>
          <div className="rounded-lg border border-border bg-surface-elevated px-2 py-2">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted">
              Combo
            </p>
            <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums">
              ×1.5
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
