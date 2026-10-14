import type { Color, NumberCount, Shading, Shape } from "@/core";
import { CardSymbolStack } from "../card-symbol-stack";

export type ShowcaseCard = {
  number: NumberCount;
  color: Color;
  shape: Shape;
  shading: Shading;
};

type RulesSetShowcaseProps = {
  title: string;
  lead?: string;
  cards: readonly [ShowcaseCard, ShowcaseCard, ShowcaseCard];
  variant: "valid" | "invalid";
  footnote?: string;
};

export function RulesSetShowcase({
  title,
  lead,
  cards,
  variant,
  footnote,
}: RulesSetShowcaseProps) {
  const badge =
    variant === "valid"
      ? {
          label: "Geldige SET",
          className:
            "border-success/30 bg-success-bg text-success",
        }
      : {
          label: "Geen SET",
          className: "border-danger/30 bg-danger-bg text-danger",
        };

  return (
    <article className="rounded-xl border border-border bg-surface shadow-[var(--shadow-card)]">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
        <div className="min-w-0">
          <h3 className="font-display text-base font-semibold text-foreground">
            {title}
          </h3>
          {lead ? (
            <p className="mt-1 text-sm leading-relaxed text-muted">{lead}</p>
          ) : null}
        </div>
        <span
          className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-semibold ${badge.className}`}
        >
          {badge.label}
        </span>
      </div>
      <div className="flex justify-center gap-2 px-4 py-5 sm:gap-4 sm:px-5">
        {cards.map((card, index) => (
          <div
            key={`${card.color}-${card.shape}-${card.number}-${index}`}
            className="w-[4.5rem] min-[400px]:w-[5.25rem] sm:w-[5.75rem]"
          >
            <div
              className="aspect-[5/7] rounded-xl border-2 border-border bg-card-face p-1.5 shadow-[var(--shadow-card)] sm:p-2"
              aria-hidden
            >
              <CardSymbolStack
                number={card.number}
                color={card.color}
                shape={card.shape}
                shading={card.shading}
              />
            </div>
          </div>
        ))}
      </div>
      {footnote ? (
        <p className="border-t border-border px-4 py-3 text-sm text-muted sm:px-5">
          {footnote}
        </p>
      ) : null}
    </article>
  );
}
