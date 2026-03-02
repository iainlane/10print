import { describe, expect, it } from "vitest";

import { configSchema, type TenPrintConfig } from "@/lib/config";
import { valueToString } from "@/lib/svg-api/helpers";
import { generateTenPrintGroupContent, seededRandom } from "@/lib/tenprint";
import { createExpectedTenPrintGroup } from "@/lib/tenprint/test-utils";

describe("TenPrint Library", () => {
  describe("seededRandom", () => {
    it("should return deterministic values for the same input", () => {
      expect(seededRandom(1, 1, 123)).toBe(seededRandom(1, 1, 123));
      expect(seededRandom(10, 20, 456)).toBe(seededRandom(10, 20, 456));
    });

    it("should return different values for different seeds", () => {
      expect(seededRandom(1, 1, 123)).not.toBe(seededRandom(1, 1, 456));
    });

    it("should return different values for different coordinates", () => {
      expect(seededRandom(1, 1, 123)).not.toBe(seededRandom(1, 2, 123));
      expect(seededRandom(1, 1, 123)).not.toBe(seededRandom(2, 1, 123));
    });

    it("should return a value between 0 (inclusive) and 1 (exclusive)", () => {
      const val = seededRandom(5, 5, 789);
      expect(val).toBeGreaterThanOrEqual(0);
      expect(val).toBeLessThan(1);
    });
  });

  describe("generateTenPrintGroupContent", () => {
    const baseConfig: TenPrintConfig = {
      ...configSchema.parse({}), // Get defaults
      seed: 123,
    };

    it("should return an SVGGElement", () => {
      const result = generateTenPrintGroupContent(
        document,
        baseConfig,
        100,
        100,
      );
      expect(result.tagName.toLowerCase()).toBe("g");
    });

    it("should set stroke-width and stroke-linecap attributes", () => {
      const config = { ...baseConfig, lineThickness: 3 };
      const result = generateTenPrintGroupContent(document, config, 100, 100);
      expect(result.getAttribute("stroke-width")).toBe("3");
      expect(result.getAttribute("stroke-linecap")).toBe("round");
    });

    it("should return an empty group if width or height is zero or negative", () => {
      const group1 = generateTenPrintGroupContent(document, baseConfig, 0, 100);
      expect(group1.childNodes.length).toBe(0);

      const group2 = generateTenPrintGroupContent(document, baseConfig, 100, 0);
      expect(group2.childNodes.length).toBe(0);

      const group3 = generateTenPrintGroupContent(
        document,
        baseConfig,
        -10,
        100,
      );
      expect(group3.childNodes.length).toBe(0);
    });

    it("should generate path elements inside the group", () => {
      const result = generateTenPrintGroupContent(document, baseConfig, 1, 1);
      const expected = createExpectedTenPrintGroup(document, {
        lineThickness: baseConfig.lineThickness,
        firstStroke: valueToString(baseConfig.firstColour),
        secondStroke: valueToString(baseConfig.secondColour),
      });

      expect(result.isEqualNode(expected)).toBe(true);
    });

    it("should assign correct stroke colours and path data", () => {
      const config = configSchema.parse({
        firstColour: "#ff0000",
        secondColour: "#0000ff",
        seed: 123,
      });
      const result = generateTenPrintGroupContent(document, config, 1, 1);
      const expected = createExpectedTenPrintGroup(document, {
        lineThickness: config.lineThickness,
        firstStroke: valueToString(config.firstColour),
        secondStroke: valueToString(config.secondColour),
      });

      expect(result.isEqualNode(expected)).toBe(true);
    });
  });
});
