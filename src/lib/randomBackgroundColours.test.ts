import { inGamut, modeOklch, modeP3, type Oklch, useMode } from "culori/fn";
import { describe, expect, it } from "vitest";

import { randomBackgroundColours } from "./randomBackgroundColours";

const oklch = useMode(modeOklch);
useMode(modeP3);
const isInP3 = inGamut("p3");

describe("randomBackgroundColours", () => {
  it("returns two OKLCH colours", () => {
    const { firstColour, secondColour } = randomBackgroundColours();
    const a = oklch(firstColour);
    const b = oklch(secondColour);
    expect(a.mode).toBe("oklch");
    expect(b.mode).toBe("oklch");
    expect(typeof a.l).toBe("number");
    expect(typeof a.c).toBe("number");
    expect(typeof a.h).toBe("number");
    expect(typeof b.l).toBe("number");
    expect(typeof b.c).toBe("number");
    expect(typeof b.h).toBe("number");
  });

  it("is deterministic given the same seed", () => {
    const seed = "12345";
    const r1 = randomBackgroundColours({ seed });
    const r2 = randomBackgroundColours({ seed });
    const a1 = oklch(r1.firstColour);
    const b1 = oklch(r1.secondColour);
    const a2 = oklch(r2.firstColour);
    const b2 = oklch(r2.secondColour);
    expect(a1.l).toBeCloseTo(a2.l, 10);
    expect(a1.c).toBeCloseTo(a2.c, 10);
    expect(a1.h).toBeCloseTo(a2.h ?? 0, 10);
    expect(b1.l).toBeCloseTo(b2.l, 10);
    expect(b1.c).toBeCloseTo(b2.c, 10);
    expect(b1.h).toBeCloseTo(b2.h ?? 0, 10);
  });

  it("produces P3 in-gamut colours", () => {
    const { firstColour, secondColour } = randomBackgroundColours({
      seed: "p3",
    });
    expect(isInP3(firstColour)).toBe(true);
    expect(isInP3(secondColour)).toBe(true);
  });

  it("keeps stroke lightness in the darker band for light backgrounds", () => {
    // Light background (near white)
    const background: Oklch = { mode: "oklch", l: 0.97, c: 0, h: 0 };
    const { firstColour, secondColour } = randomBackgroundColours({
      seed: "light-bg",
      background,
    });
    const a = oklch(firstColour);
    const b = oklch(secondColour);
    // Expect both to be comfortably darker than the background
    expect(a.l).toBeGreaterThanOrEqual(0.2);
    expect(a.l).toBeLessThanOrEqual(0.7);
    expect(b.l).toBeGreaterThanOrEqual(0.2);
    expect(b.l).toBeLessThanOrEqual(0.7);
    expect(a.l).toBeLessThan(background.l);
    expect(b.l).toBeLessThan(background.l);
  });

  it("keeps stroke lightness in the lighter band for dark backgrounds", () => {
    // Dark background (near black)
    const background: Oklch = { mode: "oklch", l: 0.1, c: 0, h: 0 };
    const { firstColour, secondColour } = randomBackgroundColours({
      seed: "dark-bg",
      background,
    });
    const a = oklch(firstColour);
    const b = oklch(secondColour);
    // Expect both to be comfortably lighter than the background
    expect(a.l).toBeGreaterThanOrEqual(0.55);
    expect(a.l).toBeLessThanOrEqual(0.92);
    expect(b.l).toBeGreaterThanOrEqual(0.55);
    expect(b.l).toBeLessThanOrEqual(0.92);
    expect(a.l).toBeGreaterThan(background.l);
    expect(b.l).toBeGreaterThan(background.l);
  });

  it("enforces a reasonable lightness separation between strokes", () => {
    const { firstColour, secondColour } = randomBackgroundColours({
      seed: "dl",
    });
    const a = oklch(firstColour);
    const b = oklch(secondColour);
    const deltaL = Math.abs(a.l - b.l);
    // Expected range roughly 0.11..0.17 with band clamping tolerances
    expect(deltaL).toBeGreaterThanOrEqual(0.09);
    expect(deltaL).toBeLessThanOrEqual(0.19);
  });

  it("keeps chroma within safe bounds for P3", () => {
    // The generator targets ~0.06..0.20 before clamping;
    // after clamp, it should not exceed ~0.20 by any meaningful margin.
    const { firstColour, secondColour } = randomBackgroundColours({
      seed: "c-bounds",
    });
    const a = oklch(firstColour);
    const b = oklch(secondColour);
    expect(a.c).toBeGreaterThanOrEqual(0.0); // after clamp it may drop below min
    expect(a.c).toBeLessThanOrEqual(0.205);
    expect(b.c).toBeGreaterThanOrEqual(0.0);
    expect(b.c).toBeLessThanOrEqual(0.205);
  });

  it("does not return identical colours", () => {
    const { firstColour, secondColour } = randomBackgroundColours({
      seed: "distinct",
    });
    const a = oklch(firstColour);
    const b = oklch(secondColour);
    const sameL = Math.abs(a.l - b.l) < 1e-6;
    const sameC = Math.abs(a.c - b.c) < 1e-6;
    const sameH = Math.abs((a.h ?? 0) - (b.h ?? 0)) < 1e-6;
    expect(sameL && sameC && sameH).toBe(false);
  });

  it("works without options", () => {
    expect(() => randomBackgroundColours()).not.toThrow();
  });

  it("respects a provided background colour object in any culori mode", () => {
    // Provide a P3 colour as background; function should accept any culori Color
    const backgroundP3 = { mode: "p3", r: 0.95, g: 0.95, b: 0.95 } as const;
    const { firstColour, secondColour } = randomBackgroundColours({
      seed: "p3-bg",
      background: backgroundP3,
    });
    const a = oklch(firstColour);
    const b = oklch(secondColour);
    expect(a.mode).toBe("oklch");
    expect(b.mode).toBe("oklch");
  });
});
