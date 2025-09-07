import { StatusCodes } from "http-status-codes";
import { URL } from "url";
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import { configSchema, DEFAULT_CONFIG } from "@/lib/config";
import { parse } from "@/lib/culori";

import {
  normaliseUrlAndRedirect,
  parseAndValidateQueryParameters,
  type SvgQueryParams,
  svgQuerySchema,
  valueToString,
} from "./helpers";

const BASE_URL = "http://localhost/svg";

describe("SVG API Helpers", () => {
  describe("parseAndValidateQueryParameters", () => {
    const defaults = configSchema.parse({});

    it("should parse valid parameters correctly", async () => {
      const url = new URL(
        `${BASE_URL}?width=200&height=100&gridSize=15&firstColour=%23ff0000`,
      );
      const params = await parseAndValidateQueryParameters(url.searchParams);
      expect(params.width).toBe(200);
      expect(params.height).toBe(100);
      expect(params.gridSize).toBe(15);
      expect(params.firstColour).toStrictEqual({
        mode: "rgb",
        r: 1,
        g: 0,
        b: 0,
      });
      // Check a default value is still present
      expect(params.secondColour).toBe(defaults.secondColour);
    });

    it("should use default values for missing optional parameters", async () => {
      const { searchParams } = new URL(`${BASE_URL}?width=50&height=50`);
      const params = await parseAndValidateQueryParameters(searchParams);
      expect(params.width).toBe(50);
      expect(params.height).toBe(50);
      expect(params.gridSize).toBe(defaults.gridSize);
      expect(params.lineThickness).toBe(defaults.lineThickness);
      expect(params.firstColour).toBe(defaults.firstColour);
      expect(params.secondColour).toBe(defaults.secondColour);
      expect(params.seed).toBeDefined(); // Seed is generated if not provided
    });

    const invalidParamCases = [
      { name: "missing width", query: "?height=100" },
      { name: "missing height", query: "?width=100" },
      { name: "invalid width type", query: "?width=abc&height=100" },
      { name: "invalid height type", query: "?width=100&height=xyz" },
      {
        name: "invalid gridSize type",
        query: "?width=100&height=100&gridSize=small",
      },
      { name: "non-positive width", query: "?width=0&height=100" },
      { name: "negative height", query: "?width=100&height=-50" },
      {
        name: "invalid colour format",
        query: "?width=100&height=100&firstColour=invalid",
      },
    ];

    it.each(invalidParamCases)(
      "should reject request with $name",
      async ({ query }) => {
        const { searchParams } = new URL(`${BASE_URL}${query}`);
        await expect(
          parseAndValidateQueryParameters(searchParams),
        ).rejects.toThrow(ZodError);
      },
    );

    it("should parse parameters provided as strings", async () => {
      const url = new URL(
        `${BASE_URL}?width=300&height=150&gridSize=25&firstColour=hotpink`,
      );

      // We don't care what the specific representation is, just that it is hot
      // pink!
      const culoriHotPink = parse("hotpink");

      const expectedParms = {
        ...DEFAULT_CONFIG,
        width: 300,
        height: 150,
        gridSize: 25,
        firstColour: culoriHotPink,
        seed: expect.any(Number) as number,
      };

      const params = await parseAndValidateQueryParameters(url.searchParams);
      expect(params).toEqual(expectedParms);
    });
  });

  describe("normalizeUrlAndRedirect", () => {
    const defaults = DEFAULT_CONFIG;
    const baseParams = {
      width: 100,
      height: 100,
      ...DEFAULT_CONFIG,
    };

    const sortedParamEntries = Object.entries(baseParams)
      .map(([key, value]) => [key, valueToString(value)])
      .sort(([a], [b]) => (a as string).localeCompare(b as string));
    const canonicalQuery = new URLSearchParams(sortedParamEntries).toString();

    // Helper function to generate canonical URL string from params within a test
    const generateExpectedUrl = (params: SvgQueryParams): string => {
      const sorted = Object.entries(params)
        .map(([key, value]): [string, string] => [key, valueToString(value)])
        .sort(([a], [b]) => a.localeCompare(b));
      const query = new URLSearchParams(sorted).toString();
      return `${BASE_URL}?${query}`;
    };

    it("should return null (no redirect needed) for an already canonical URL", () => {
      const url = new URL(`${BASE_URL}?${canonicalQuery}`);
      const finalParams = svgQuerySchema.parse(
        Object.fromEntries(url.searchParams),
      );

      const response = normaliseUrlAndRedirect(url, finalParams);
      expect(response).toBeNull();
    });

    it("should return 301 for a URL needing parameter reordering", () => {
      // Same params as canonical, but different order
      const url = new URL(
        `${BASE_URL}?height=100&width=100&seed=${defaults.seed.toString()}&gridSize=${defaults.gridSize.toString()}&firstColour=${encodeURIComponent(valueToString(defaults.firstColour))}&secondColour=${encodeURIComponent(valueToString(defaults.secondColour))}&lineThickness=${defaults.lineThickness.toString()}`,
      );
      const finalParams = svgQuerySchema.parse(
        Object.fromEntries(url.searchParams),
      );
      const response = normaliseUrlAndRedirect(url, finalParams);
      const expectedUrl = generateExpectedUrl(finalParams); // Generate expected URL from actual params

      expect(response).not.toBeNull();
      expect(response?.status).toBe(StatusCodes.MOVED_PERMANENTLY); // 301
      expect(response?.headers.get("Location")).toBe(expectedUrl); // Compare against generated URL
      expect(response?.headers.get("Cache-Control")).toBe(
        "public, max-age=3600",
      );
    });

    it("should return 302 for a URL missing parameters (using defaults)", () => {
      // Missing optional params like gridSize, seed etc.
      const url = new URL(`${BASE_URL}?width=100&height=100`);
      const finalParams = svgQuerySchema.parse(
        Object.fromEntries(url.searchParams),
      ); // Will include defaults
      const response = normaliseUrlAndRedirect(url, finalParams);
      const expectedUrl = generateExpectedUrl(finalParams); // Generate expected URL

      expect(response).not.toBeNull();
      expect(response?.status).toBe(StatusCodes.MOVED_TEMPORARILY); // 302
      expect(response?.headers.get("Location")).toBe(expectedUrl); // Compare against generated URL
      expect(response?.headers.get("Cache-Control")).toBe("public, max-age=60");
    });

    it("should return 302 for a URL with mixed missing and out-of-order params", () => {
      // height before width, missing seed/colours
      const url = new URL(
        `${BASE_URL}?height=100&width=100&gridSize=${defaults.gridSize.toString()}&lineThickness=${defaults.lineThickness.toString()}`,
      );
      const finalParams = svgQuerySchema.parse(
        Object.fromEntries(url.searchParams),
      );
      const response = normaliseUrlAndRedirect(url, finalParams);
      const expectedUrl = generateExpectedUrl(finalParams); // Generate expected URL

      expect(response).not.toBeNull();
      expect(response?.status).toBe(StatusCodes.MOVED_TEMPORARILY); // 302
      expect(response?.headers.get("Location")).toBe(expectedUrl); // Compare against generated URL
      expect(response?.headers.get("Cache-Control")).toBe("public, max-age=60");
    });

    it("should handle encoded colour parameters correctly", () => {
      const colour1 = "#FF0000";
      const colour2 = "#00FF00";
      const url = new URL(
        `${BASE_URL}?width=100&height=100&firstColour=${encodeURIComponent(colour1)}&secondColour=${encodeURIComponent(colour2)}`,
      );
      const finalParams = svgQuerySchema.parse(
        Object.fromEntries(url.searchParams),
      );
      const response = normaliseUrlAndRedirect(url, finalParams);
      const expectedUrl = generateExpectedUrl(finalParams); // Generate expected URL

      // Expect a 302 because other defaults are missing
      expect(response).not.toBeNull();
      expect(response?.status).toBe(StatusCodes.MOVED_TEMPORARILY);

      // Check that the location URL has the colours correctly formatted and sorted
      expect(response?.headers.get("Location")).toBe(expectedUrl); // Compare against generated URL
    });
  });
});
