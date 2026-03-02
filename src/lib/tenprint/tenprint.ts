import { TenPrintConfig } from "@/lib/config";
import { valueToString } from "@/lib/svg-api/helpers";

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * Generate a seed for the random number generator.
 *
 * @param x The x coordinate
 * @param y The y coordinate
 * @param seed The seed value
 * @returns A random number between 0 and 1
 */
export function seededRandom(x: number, y: number, seed: number): number {
  const hash = Math.sin(x * 12.9898 + y * 78.233 + seed) * 43758.5453;
  return hash - Math.floor(hash);
}

/**
 * Generates the content for a 10 PRINT SVG <g> element. This is the algorithm
 * which draws the graphic itself.
 *
 * @param doc The DOM document object (real or simulated) to use for creating elements.
 * @param config The full TenPrint configuration.
 * @param width The desired width of the SVG pattern area.
 * @param height The desired height of the SVG pattern area.
 * @returns An SVGGElement containing all the calculated diagonal path data.
 */
export function generateTenPrintGroupContent(
  doc: Document,
  config: TenPrintConfig,
  width: number,
  height: number,
): SVGGElement {
  const { gridSize, seed, lineThickness, firstColour, secondColour } = config;

  const groupElement = doc.createElementNS(SVG_NS, "g");
  groupElement.setAttribute("stroke-width", lineThickness.toString());
  groupElement.setAttribute("stroke-linecap", "round");
  groupElement.setAttribute("fill", "none");

  if (width <= 0 || height <= 0) {
    return groupElement; // Return empty group
  }

  // Clamp the cell size to the grid size
  const minDimension = Math.min(width, height);
  const maxDimension = Math.max(width, height);
  const cellSize =
    minDimension < gridSize
      ? minDimension / Math.min(gridSize, minDimension)
      : maxDimension / gridSize;
  const cols = Math.ceil(width / cellSize) + 1;
  const rows = Math.ceil(height / cellSize) + 1;

  const forwardPathCommands: string[] = [];
  const backwardPathCommands: string[] = [];

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

      const command = `M${x1.toString()} ${y1.toString()}L${x2.toString()} ${y2.toString()}`;

      if (isForwardDiagonal) {
        forwardPathCommands.push(command);
      } else {
        backwardPathCommands.push(command);
      }
    }
  }

  if (forwardPathCommands.length > 0) {
    const forwardPath = doc.createElementNS(SVG_NS, "path");
    forwardPath.setAttribute("stroke", valueToString(firstColour));
    forwardPath.setAttribute("d", forwardPathCommands.join(""));
    groupElement.appendChild(forwardPath);
  }

  if (backwardPathCommands.length > 0) {
    const backwardPath = doc.createElementNS(SVG_NS, "path");
    backwardPath.setAttribute("stroke", valueToString(secondColour));
    backwardPath.setAttribute("d", backwardPathCommands.join(""));
    groupElement.appendChild(backwardPath);
  }

  return groupElement;
}
