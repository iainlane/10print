import { describe, expect, it } from "vitest";
import { z } from "zod";

import {
  configSchema,
  DEFAULT_CONFIG,
  STORAGE_KEY,
  THEME_STORAGE_KEY,
  themeSchema,
} from "./config";

describe("config.ts", () => {
  describe("constants", () => {
    it("should export correct storage keys", () => {
      expect(STORAGE_KEY).toBe("tenprint-config");
      expect(THEME_STORAGE_KEY).toBe("tenprint-theme");
    });
  });

  describe("configSchema", () => {
    it("should parse valid config", () => {
      const validConfig = {
        gridSize: 50,
        lineThickness: 3,
        firstColour: "#FF0000",
        secondColour: "#00FF00",
        seed: 0.123,
      };
      const result = configSchema.safeParse(validConfig);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(validConfig);
    });

    it("should use default values for undefined fields", () => {
      const result = configSchema.safeParse({});
      expect(result.success).toBe(true);

      // Seed is a random number
      const { seed: _seed, ...defaultsWithoutSeed } = DEFAULT_CONFIG;
      expect(result.data).toEqual(expect.objectContaining(defaultsWithoutSeed));
      expect(result.data?.seed).toBeTypeOf("number");
    });

    it("should use default values when parsing undefined", () => {
      const result = configSchema.safeParse(undefined);
      expect(result.success).toBe(true);

      // Seed is a random number
      const { seed: _seed, ...defaultsWithoutSeed } = DEFAULT_CONFIG;
      expect(result.data).toEqual(expect.objectContaining(defaultsWithoutSeed));
      expect(result.data?.seed).toBeTypeOf("number");
    });

    it.each([
      // Invalid gridSize
      [{ gridSize: 5 }, "gridSize"],
      [{ gridSize: 5.5 }, "gridSize"],
      [{ gridSize: 101 }, "gridSize"],
      [{ gridSize: "abc" }, "gridSize"],
      // Invalid lineThickness
      [{ lineThickness: 0 }, "lineThickness"],
      [{ lineThickness: 6 }, "lineThickness"],
      [{ lineThickness: "xyz" }, "lineThickness"],
      // Invalid colours
      [{ firstColour: "invalid" }, "firstColour"],
      [{ firstColour: "#12345" }, "firstColour"],
      [{ secondColour: "badcolor" }, "secondColour"],
      [{ secondColour: "#ABCDEFG" }, "secondColour"],
      // Invalid seed
      [{ seed: "not a number" }, "seed"],
    ])("should reject invalid config: %s", (invalidInput, path) => {
      const result = configSchema.safeParse({
        ...DEFAULT_CONFIG,
        ...invalidInput,
      });

      const { success, error } = result;

      expect(success).toBe(false);
      expect(error).toBeInstanceOf(z.ZodError);
      const errorTree = z.treeifyError(error!); // eslint-disable-line @typescript-eslint/no-non-null-assertion
      expect(Object.keys(errorTree.properties ?? {})).toEqual([path]);
    });

    it.each([
      ["#123456"],
      ["hotpink"],
      ["rgb(255, 0, 0)"],
      ["hsl(0, 100%, 50%)"],
      ["rgba(255, 0, 0, 0.5)"],
      ["hsla(0, 100%, 50%, 0.5)"],
    ])("should accept valid CSS colours: %s", (colour) => {
      const result = configSchema.safeParse({
        ...DEFAULT_CONFIG,
        firstColour: colour,
        secondColour: colour,
      });

      expect(result.error).toBeUndefined();
      expect(result.data).toEqual({
        ...DEFAULT_CONFIG,
        firstColour: colour,
        secondColour: colour,
      });
    });

    it.each([["#12345"], ["foo(1 2 3)"], ["invalid"]])(
      "should reject invalid CSS colours: %s",
      (colour) => {
        const result = configSchema.safeParse({
          ...DEFAULT_CONFIG,
          firstColour: colour,
          secondColour: colour,
        });

        expect(result.error).toBeInstanceOf(z.ZodError);
      },
    );

    it("should accept undefined within the object fields", () => {
      const result = configSchema.safeParse({
        ...DEFAULT_CONFIG,
        gridSize: undefined,
      });

      const { success, data } = result;

      expect(success).toBe(true);
      expect(data).toEqual(DEFAULT_CONFIG);
    });
  });

  describe("themeSchema", () => {
    it.each([["light"], ["dark"], ["auto"]])(
      "should parse valid theme: %s",
      (theme) => {
        const result = themeSchema.safeParse(theme);

        expect(result.success).toBe(true);
        expect(result.data).toBe(theme);
      },
    );

    it("should use default value 'auto' for undefined", () => {
      const result = themeSchema.safeParse(undefined);

      expect(result.success).toBe(true);
      expect(result.data).toBe("auto");
    });

    it.each([
      ["light "], // Extra space
      ["DARK"], // Incorrect case
      ["system"], // Invalid value
      [123], // Invalid type
      [{}], // Invalid type
    ])("should reject invalid theme: %s", (invalidInput) => {
      const result = themeSchema.safeParse(invalidInput);

      const { success, error } = result;

      expect(success).toBe(false);
      expect(error).toBeInstanceOf(z.ZodError);
    });
  });
});
