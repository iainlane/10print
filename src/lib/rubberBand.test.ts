import { describe, expect, it } from "vitest";

import { applyRubberBand } from "@/lib/rubberBand";

describe("applyRubberBand", () => {
  it("passes through delta within bounds", () => {
    expect(applyRubberBand(50, 200)).toBe(50);
    expect(applyRubberBand(-50, 200)).toBe(-50);
  });

  it("dampens delta beyond the limit", () => {
    const result = applyRubberBand(300, 200);
    expect(result).toBeGreaterThan(200);
    expect(result).toBeLessThan(300);
  });

  it("dampens negative delta beyond the limit", () => {
    const result = applyRubberBand(-300, 200);
    expect(result).toBeLessThan(-200);
    expect(result).toBeGreaterThan(-300);
  });

  it("fully dampens when limit is zero", () => {
    const result = applyRubberBand(100, 0);
    expect(result).toBeGreaterThan(0);
    expect(result).toBeLessThan(100);
  });

  it("fully dampens negative when limit is zero", () => {
    const result = applyRubberBand(-100, 0);
    expect(result).toBeLessThan(0);
    expect(result).toBeGreaterThan(-100);
  });

  it("returns zero for zero delta", () => {
    expect(applyRubberBand(0, 200)).toBe(0);
  });

  it("is symmetric: opposite sign gives negated result", () => {
    expect(applyRubberBand(100, 0)).toBe(-applyRubberBand(-100, 0));
    expect(applyRubberBand(300, 200)).toBe(-applyRubberBand(-300, 200));
  });
});
