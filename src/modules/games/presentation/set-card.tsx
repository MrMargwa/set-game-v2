"use client";

import type { Card } from "@/core";
import type { Color, NumberCount, Shading, Shape } from "@/core";
import { CardSymbolStack } from "./card-symbol-stack";

const NUMBER_LABEL: Record<NumberCount, string> = {
  1: "één",
  2: "twee",
  3: "drie",
};

const COLOR_LABEL: Record<Color, string> = {
  red: "rode",
  green: "groene",
  purple: "paarse",
};

const SHADING_LABEL: Record<Shading, string> = {
  open: "open",
  striped: "gestreept",
  solid: "gevuld",
};

function shapeLabel(shape: Shape, count: NumberCount): string {
  if (count === 1) {
    if (shape === "diamond") return "ruit";
    if (shape === "oval") return "ovaal";
    return "golf";
  }
  if (shape === "diamond") return "ruiten";
  if (shape === "oval") return "ovalen";
  return "golven";
}

function cardAccessibleName(card: Card): string {
  const { number, color, shape, shading } = card.attributes;
  return `${NUMBER_LABEL[number]} ${COLOR_LABEL[color]} ${shapeLabel(shape, number)}, ${SHADING_LABEL[shading]}`;
}

type SetCardProps = {
  card: Card;
  selected?: boolean;
  feedback?: "success" | "error";
  hinted?: boolean;
  celebrateSuccess?: boolean;
  exiting?: boolean;
  onSelect?: () => void;
};

export function SetCard({
  card,
  selected,
  feedback,
  hinted,
  celebrateSuccess,
  exiting,
  onSelect,
}: SetCardProps) {
  const { number, shape, shading, color } = card.attributes;

  return (
    <button
      type="button"
      data-testid={`card-${card.id}`}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={`${cardAccessibleName(card)}${hinted ? ", hint" : ""}`}
      className={`animate-card-enter relative flex aspect-[5/7] w-full min-w-0 touch-manipulation flex-col rounded-xl border-2 bg-card-face p-1.5 shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color,background-color,opacity] duration-[var(--motion-normal)] ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:p-2 ${
        selected && !celebrateSuccess && !exiting
          ? "border-ring bg-accent-muted/20 ring-2 ring-ring/40"
          : "border-border"
      } ${
        hinted && !celebrateSuccess && !exiting
          ? "z-[1] scale-[1.02] border-competition bg-competition/5 animate-hint-pulse"
          : ""
      } ${
        feedback === "error"
          ? "animate-set-shake border-danger bg-danger-bg/60"
          : ""
      } ${
        celebrateSuccess
          ? "z-[2] scale-[1.04] border-success bg-success-bg/60 ring-2 ring-success/45 animate-set-success-glow"
          : ""
      } ${
        exiting ? "animate-set-card-exit z-[2] border-success/80 bg-success-bg/40" : ""
      }`}
    >
      <CardSymbolStack
        number={number}
        color={color}
        shape={shape}
        shading={shading}
      />
      {selected && !celebrateSuccess && !exiting ? (
        <span
          aria-hidden
          className="absolute top-1 right-1 grid size-5 place-items-center rounded-full bg-accent text-[0.7rem] font-bold leading-none text-accent-foreground shadow-sm"
        >
          ✓
        </span>
      ) : null}
      {hinted && !celebrateSuccess && !exiting ? (
        <span
          aria-hidden
          className="absolute top-1 left-1 rounded bg-competition px-1 py-0.5 text-[0.6rem] font-bold uppercase leading-none text-[#1c1917]"
        >
          Hint
        </span>
      ) : null}
    </button>
  );
}
