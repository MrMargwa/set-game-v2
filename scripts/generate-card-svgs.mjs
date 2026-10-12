/**
 * Eén symbool per bestand: public/assets/cards/{color}-{shape}-{shading}.svg
 * Run: npm run assets:cards
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, "..", "public", "assets", "cards");

const COLORS = {
  red: "#d64045",
  green: "#2a9d6f",
  purple: "#7b5ea7",
};

const SHAPES = ["diamond", "squiggle", "oval"];
const SHADINGS = ["solid", "open", "striped"];

/** Zelfde viewBox zodat 1/2/3 symbolen even zwaar ogen op de kaart. */
const VIEWBOX = "0 0 160 80";

function cubicPoint(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    u ** 3 * p0[0] + 3 * u ** 2 * t * p1[0] + 3 * u * t ** 2 * p2[0] + t ** 3 * p3[0],
    u ** 3 * p0[1] + 3 * u ** 2 * t * p1[1] + 3 * u * t ** 2 * p2[1] + t ** 3 * p3[1],
  ];
}

function cubicTangent(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return [
    3 * u ** 2 * (p1[0] - p0[0]) + 6 * u * t * (p2[0] - p1[0]) + 3 * t ** 2 * (p3[0] - p2[0]),
    3 * u ** 2 * (p1[1] - p0[1]) + 6 * u * t * (p2[1] - p1[1]) + 3 * t ** 2 * (p3[1] - p2[1]),
  ];
}

/** Dikke S-golf: middenlijn + ronde koppen, constante breedte. */
function squiggleOutline() {
  const p0 = [34, 46];
  const p1 = [68, 18];
  const p2 = [92, 62];
  const p3 = [126, 34];
  const radius = 13;
  const steps = 32;
  const upper = [];
  const lower = [];

  function sample(t) {
    const [x, y] = cubicPoint(p0, p1, p2, p3, t);
    let [dx, dy] = cubicTangent(p0, p1, p2, p3, t);
    const len = Math.hypot(dx, dy) || 1;
    dx /= len;
    dy /= len;
    return { x, y, tx: dx, ty: dy, nx: -dy, ny: dx };
  }

  for (let i = 0; i <= steps; i += 1) {
    const s = sample(i / steps);
    upper.push([s.x + s.nx * radius, s.y + s.ny * radius]);
    lower.push([s.x - s.nx * radius, s.y - s.ny * radius]);
  }

  const end = sample(1);
  const start = sample(0);
  const capSteps = 10;
  const endCap = [];
  const startCap = [];
  for (let i = 1; i < capSteps; i += 1) {
    const theta = (Math.PI * i) / capSteps;
    endCap.push([
      end.x + Math.cos(theta) * end.nx * radius + Math.sin(theta) * end.tx * radius,
      end.y + Math.cos(theta) * end.ny * radius + Math.sin(theta) * end.ty * radius,
    ]);
    const back = Math.PI + theta;
    startCap.push([
      start.x + Math.cos(back) * start.nx * radius + Math.sin(back) * start.tx * radius,
      start.y + Math.cos(back) * start.ny * radius + Math.sin(back) * start.ty * radius,
    ]);
  }

  const fmt = ([x, y]) => `${x.toFixed(2)} ${y.toFixed(2)}`;
  const parts = [`M ${fmt(upper[0])}`];
  for (let i = 1; i < upper.length; i += 1) parts.push(`L ${fmt(upper[i])}`);
  for (const pt of endCap) parts.push(`L ${fmt(pt)}`);
  for (let i = lower.length - 1; i >= 0; i -= 1) parts.push(`L ${fmt(lower[i])}`);
  for (const pt of startCap) parts.push(`L ${fmt(pt)}`);
  parts.push("Z");
  return parts.join(" ");
}

const SHAPE_PATH = {
  diamond: "M80 6 L152 40 L80 74 L8 40 Z",
  oval: "M38 18 H122 A22 22 0 0 1 122 62 H38 A22 22 0 0 1 38 18 Z",
  squiggle: squiggleOutline(),
};

function stripeLines(hex) {
  const lines = [];
  for (let x = -20; x <= 260; x += 8) {
    lines.push(
      `<line x1="${x}" y1="-8" x2="${x - 88}" y2="88" stroke="${hex}" stroke-width="2.4"/>`,
    );
  }
  return lines.join("\n    ");
}

function buildSvg(colorName, shape, shading) {
  const hex = COLORS[colorName];
  const d = SHAPE_PATH[shape];
  const clipId = `clip-${colorName}-${shape}-${shading}`;

  if (shading === "solid") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" fill="none">
  <path d="${d}" fill="${hex}" stroke="${hex}" stroke-width="2" stroke-linejoin="round"/>
</svg>
`;
  }

  if (shading === "open") {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" fill="none">
  <path d="${d}" fill="none" stroke="${hex}" stroke-width="3.25" stroke-linejoin="round" stroke-linecap="round"/>
</svg>
`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VIEWBOX}" fill="none">
  <defs>
    <clipPath id="${clipId}">
      <path d="${d}"/>
    </clipPath>
  </defs>
  <g clip-path="url(#${clipId})">
    ${stripeLines(hex)}
  </g>
  <path d="${d}" fill="none" stroke="${hex}" stroke-width="3.25" stroke-linejoin="round" stroke-linecap="round"/>
</svg>
`;
}

await mkdir(outDir, { recursive: true });

let count = 0;
for (const color of Object.keys(COLORS)) {
  for (const shape of SHAPES) {
    for (const shading of SHADINGS) {
      const name = `${color}-${shape}-${shading}.svg`;
      await writeFile(path.join(outDir, name), buildSvg(color, shape, shading), "utf8");
      count += 1;
    }
  }
}

console.log(`Wrote ${count} SVGs to ${outDir}`);
