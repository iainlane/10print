import { memo, useEffect, useRef } from "react"; // Removed useState, useMemo

import { useWindowSize } from "@/hooks/useWindowSize";
import { TenPrintConfig } from "@/lib/config";
import { cn } from "@/lib/utils";

function seededRandom(x: number, y: number, seed: number): number {
  const hash = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return hash - Math.floor(hash);
}

interface TenPrintSvgProps extends TenPrintConfig {
  className?: string;
  onRegenerate: () => void;
}

// Define the namespace for SVG elements
const SVG_NS = "http://www.w3.org/2000/svg";

function TenPrintSvgComponent({
  className,
  gridSize,
  seed,
  lineThickness,
  firstColour,
  secondColour,
  onRegenerate,
}: TenPrintSvgProps) {
  const { width, height } = useWindowSize();
  // Use a ref to directly access the SVG group element
  const groupRef = useRef<SVGGElement>(null);

  useEffect(
    function () {
      if (width === 0 || height === 0 || !groupRef.current) {
        return;
      }

      const groupElement = groupRef.current;

      // Clear previous lines
      groupElement.innerHTML = "";

      const cellSize = Math.max(width, height) / gridSize;
      const cols = Math.ceil(width / cellSize) + 1;
      const rows = Math.ceil(height / cellSize) + 1;

      groupElement.setAttribute("stroke-width", lineThickness.toString());
      groupElement.setAttribute("stroke-linecap", "round");

      // SVG draws elements in the order they are added. We add all forward (`/)
      // lines first, then all backward (\) lines. This way, the backward lines
      // are always on top of the forward lines.
      const forwardLines = document.createDocumentFragment();
      const backwardLines = document.createDocumentFragment();

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const rawX = col * cellSize;
          const rawY = row * cellSize;
          const isForwardDiagonal = seededRandom(col, row, seed) > 0.5;

          const rawX1 = rawX;
          const rawY1 = isForwardDiagonal ? rawY + cellSize : rawY;
          const rawX2 = rawX + cellSize;
          const rawY2 = isForwardDiagonal ? rawY : rawY + cellSize;

          const x1 = Math.ceil(rawX1);
          const y1 = Math.ceil(rawY1);
          const x2 = Math.ceil(rawX2);
          const y2 = Math.ceil(rawY2);

          const line = document.createElementNS(SVG_NS, "line");

          line.setAttribute("x1", x1.toString());
          line.setAttribute("y1", y1.toString());
          line.setAttribute("x2", x2.toString());
          line.setAttribute("y2", y2.toString());
          line.classList.add(isForwardDiagonal ? "-z-1" : "-z-2");
          line.setAttribute(
            "stroke",
            isForwardDiagonal ? firstColour : secondColour,
          );

          if (isForwardDiagonal) {
            forwardLines.appendChild(line);
          } else {
            backwardLines.appendChild(line);
          }
        }
      }
      groupElement.appendChild(forwardLines);
      groupElement.appendChild(backwardLines);
    },
    [width, height, gridSize, seed, lineThickness, firstColour, secondColour],
  );

  return (
    <svg
      className={cn(
        "fixed top-0 left-0 w-full h-full z-0 cursor-pointer bg-background",
        className,
      )}
      width={width}
      height={height}
      viewBox={`0 0 ${width.toString()} ${height.toString()}`}
      onClick={onRegenerate}
      aria-hidden="true"
    >
      <g ref={groupRef} />
    </svg>
  );
}

export const TenPrintSvg = memo(TenPrintSvgComponent);
