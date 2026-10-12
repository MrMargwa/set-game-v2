import type { CardAttributes } from "@/core";
import { cardSymbolAssetPath } from "./card-symbol-path";

type CardSymbolStackProps = Pick<
  CardAttributes,
  "number" | "color" | "shape" | "shading"
> & {
  className?: string;
  symbolClassName?: string;
};

export function CardSymbolStack({
  number,
  color,
  shape,
  shading,
  className = "",
  symbolClassName = "w-[78%] max-h-[26%] object-contain",
}: CardSymbolStackProps) {
  const src = cardSymbolAssetPath({ color, shape, shading });

  return (
    <div
      className={`flex flex-1 flex-col items-center justify-evenly py-1 ${className}`}
      aria-hidden
    >
      {Array.from({ length: number }, (_, i) => (
        // eslint-disable-next-line @next/next/no-img-element -- vaste SVG-assets uit /public
        <img
          key={i}
          src={src}
          alt=""
          className={symbolClassName}
          draggable={false}
        />
      ))}
    </div>
  );
}
