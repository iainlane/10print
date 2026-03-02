const SVG_NS = "http://www.w3.org/2000/svg";

interface ExpectedTenPrintFixtureOptions {
  firstStroke: string;
  lineThickness: number;
  secondStroke: string;
}

/**
 * Build the expected SVG group for the fixture used in our tests.
 *
 * Path data here corresponds to:
 * - seed=123
 * - width=1
 * - height=1
 * - gridSize=20
 */
export function createExpectedTenPrintGroup(
  doc: Document,
  options: ExpectedTenPrintFixtureOptions,
): SVGGElement {
  const { lineThickness, firstStroke, secondStroke } = options;

  const group = doc.createElementNS(SVG_NS, "g");
  group.setAttribute("stroke-width", lineThickness.toString());
  group.setAttribute("stroke-linecap", "round");
  group.setAttribute("fill", "none");

  const forwardPath = doc.createElementNS(SVG_NS, "path");
  forwardPath.setAttribute("stroke", firstStroke);
  forwardPath.setAttribute("d", "M1 1L2 0M1 2L2 1");
  group.appendChild(forwardPath);

  const backwardPath = doc.createElementNS(SVG_NS, "path");
  backwardPath.setAttribute("stroke", secondStroke);
  backwardPath.setAttribute("d", "M0 0L1 1M0 1L1 2");
  group.appendChild(backwardPath);

  return group;
}

/**
 * Build the expected full SVG for the fixture used in our tests.
 *
 * This wraps {@link createExpectedTenPrintGroup} and shares the same fixture
 * assumptions.
 */
export function createExpectedTenPrintSvg(
  doc: Document,
  options: ExpectedTenPrintFixtureOptions,
): SVGSVGElement {
  const svg = doc.createElementNS(SVG_NS, "svg");
  svg.setAttribute("width", "1");
  svg.setAttribute("height", "1");
  svg.setAttribute("viewBox", "0 0 1 1");
  svg.setAttribute("xmlns", SVG_NS);
  svg.appendChild(createExpectedTenPrintGroup(doc, options));

  return svg;
}
