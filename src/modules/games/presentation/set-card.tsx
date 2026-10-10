"use client";

import type { Card } from "@/core";

const COLOR_MAP = {
  red: "#d64045",
  green: "#2a9d6f",
  purple: "#7b5ea7",
} as const;

type SetCardProps = {
  card: Card;
  selected?: boolean;
  onSelect?: () => void;
};

export function SetCard({ card, selected, onSelect }: SetCardProps) {
  const fill = COLOR_MAP[card.attributes.color];
  const { number, shape, shading } = card.attributes;

  return (
    <button
      type="button"
      data-testid={`card-${card.id}`}
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative flex aspect-[5/7] w-full max-w-[120px] flex-col rounded-xl border-2 bg-card-face p-2 shadow-[var(--shadow-card)] transition-[transform,box-shadow,border-color] duration-[var(--motion-fast)] ease-out hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)] focus:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${
        selected
          ? "scale-[1.02] border-ring ring-2 ring-ring/40"
          : "border-border"
      }`}
    >
      <svg viewBox="0 0 100 120" className="h-full w-full" aria-hidden>
        <defs>
          <pattern
            id={`stripe-${card.id}`}
            width="6"
            height="6"
            patternUnits="userSpaceOnUse"
            patternTransform="rotate(45)"
          >
            <rect width="6" height="6" fill="var(--card-face)" />
            <line x1="0" y1="0" x2="0" y2="6" stroke={fill} strokeWidth="2" />
          </pattern>
        </defs>
        {Array.from({ length: number }, (_, i) => {
          const y = number === 1 ? 60 : 25 + i * (70 / (number - 1));
          return (
            <ShapeGlyph
              key={i}
              shape={shape}
              shading={shading}
              color={fill}
              patternId={`stripe-${card.id}`}
              cx={50}
              cy={y}
            />
          );
        })}
      </svg>
    </button>
  );
}

function ShapeGlyph({
  shape,
  shading,
  color,
  patternId,
  cx,
  cy,
}: {
  shape: Card["attributes"]["shape"];
  shading: Card["attributes"]["shading"];
  color: string;
  patternId: string;
  cx: number;
  cy: number;
}) {
  const stroke = color;
  const fill =
    shading === "solid"
      ? color
      : shading === "open"
        ? "transparent"
        : `url(#${patternId})`;

  if (shape === "diamond") {
    return (
      <polygon
        points={`${cx},${cy - 18} ${cx + 22},${cy} ${cx},${cy + 18} ${cx - 22},${cy}`}
        fill={fill}
        stroke={stroke}
        strokeWidth={3}
      />
    );
  }

  if (shape === "oval") {
    return (
      <ellipse
        cx={cx}
        cy={cy}
        rx={26}
        ry={14}
        fill={fill}
        stroke={stroke}
        strokeWidth={3}
      />
    );
  }

  return (
    <path
      d={`M ${cx - 24} ${cy} Q ${cx - 12} ${cy - 22}, ${cx} ${cy} T ${cx + 24} ${cy} T ${cx} ${cy + 22} T ${cx - 24} ${cy}`}
      fill={fill}
      stroke={stroke}
      strokeWidth={3}
      strokeLinejoin="round"
    />
  );
}
