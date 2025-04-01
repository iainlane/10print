import { describe, expect, it } from "vitest";

import { configSchema, type TenPrintConfig } from "@/lib/config";
import { generateTenPrintGroupContent, seededRandom } from "@/lib/tenprint";

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

    it("should generate line elements inside the group", () => {
      const result = generateTenPrintGroupContent(
        document,
        baseConfig,
        100,
        100,
      );
      expect(result.childNodes.length).toBeGreaterThan(0);
      expect((result.firstChild as Element).tagName.toLowerCase()).toBe("line");
    });

    it("should assign correct stroke colors to lines", () => {
      const config = {
        ...baseConfig,
        firstColour: "#ff0000",
        secondColour: "#0000ff",
        seed: 42, // Use a specific seed for predictability
      };
      const result = generateTenPrintGroupContent(
        document,
        config,
        50, // Small size for fewer lines
        50,
      );

      let hasFirstColour = false;
      let hasSecondColour = false;

      result.querySelectorAll("line").forEach((line) => {
        const stroke = line.getAttribute("stroke");
        if (stroke === config.firstColour) {
          hasFirstColour = true;
        } else if (stroke === config.secondColour) {
          hasSecondColour = true;
        }
        expect(stroke).toMatch(/^#(?:[0-9a-fA-F]{3}){1,2}$/); // Ensure it's a hex color
      });

      // Check if both colors were used (highly likely for a reasonable grid)
      expect(hasFirstColour).toBe(true);
      expect(hasSecondColour).toBe(true);
    });
  });
});
