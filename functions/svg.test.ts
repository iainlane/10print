import { type EventContext } from "@cloudflare/workers-types";
import { StatusCodes } from "http-status-codes";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { mock } from "vitest-mock-extended";

import { configSchema } from "@/lib/config";
import { valueToString } from "@/lib/svg-api/helpers";
import * as tenprint from "@/lib/tenprint";

import { onRequestGet } from "./svg";

const { INTERNAL_SERVER_ERROR, MOVED_TEMPORARILY, OK } = StatusCodes;

function createMockContext<Env, P extends string, Data>(
  url: string,
): EventContext<Env, P, Data> {
  const mockContext = mock<EventContext<Env, P, Data>>({
    request: {
      url,
    },
  });

  return mockContext;
}

const BASE_URL = "http://localhost/svg";

describe("SVG API Endpoint (onRequestGet)", () => {
  const defaults = configSchema.parse({});

  beforeEach(() => {
    vi.resetAllMocks();
  });

  function generateCanonicalQuery(overrides = {}): string {
    const params = { ...defaults, width: 100, height: 100, ...overrides };

    const sorted = Object.entries(params)
      .map(([key, value]) => [key, valueToString(value)])
      .sort(([a], [b]) => (a as string).localeCompare(b as string));

    return new URLSearchParams(sorted).toString();
  }

  it("should return 200 OK with correct 1x1 SVG content for seed=123", async () => {
    // Fix parameters for this test for deterministic output
    const params = { seed: 123, width: 1, height: 1 };
    const query = generateCanonicalQuery(params);
    const url = `${BASE_URL}?${query}`;
    const context = createMockContext(url);

    const response = await onRequestGet(context);

    expect(response).not.toBeNull();
    expect(response.status).toBe(OK);
    expect(response.headers.get("content-type")).toBe("image/svg+xml");
    expect(response.headers.get("cache-control")).toBe("public, max-age=3600");

    const svgText = await response.text();

    // Expected SVG for seed=123, size 1x1 (based on actual output)
    const expectedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" height="1" width="1"><g stroke-linecap="round" stroke-width="${defaults.lineThickness.toString()}"><line stroke="#3B82F6" y2="0" x2="2" y1="1" x1="1" /><line stroke="#3B82F6" y2="1" x2="2" y1="2" x1="1" /><line stroke="#EC4899" y2="1" x2="1" y1="0" x1="0" /><line stroke="#EC4899" y2="2" x2="1" y1="1" x1="0" /></g></svg>`;

    expect(svgText).toBe(expectedSvg);
  });

  it("should return 200 OK with correct 1x1 SVG content using defaults and seed=666", async () => {
    // Fix parameters for this test for deterministic output
    const params = { seed: 666, width: 1, height: 1 };
    const query = generateCanonicalQuery(params);
    const url = `${BASE_URL}?${query}`;
    const context = createMockContext(url);

    const response = await onRequestGet(context);

    expect(response).not.toBeNull();
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.headers.get("content-type")).toBe("image/svg+xml");
    expect(response.headers.get("cache-control")).toBe("public, max-age=3600");

    const svgText = await response.text();

    // Expected SVG for seed=666, size 1x1 (based on actual output)
    const expectedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" height="1" width="1"><g stroke-linecap="round" stroke-width="${defaults.lineThickness.toString()}"><line stroke="#EC4899" y2="1" x2="1" y1="0" x1="0" /><line stroke="#EC4899" y2="1" x2="2" y1="0" x1="1" /><line stroke="#EC4899" y2="2" x2="1" y1="1" x1="0" /><line stroke="#EC4899" y2="2" x2="2" y1="1" x1="1" /></g></svg>`;

    expect(svgText).toBe(expectedSvg);
  });

  it("should return 200 OK with correct 1x1 SVG content for seed=987", async () => {
    // Fix parameters for this test for deterministic output
    const params = { seed: 987, width: 1, height: 1 };
    const query = generateCanonicalQuery(params);
    const url = `${BASE_URL}?${query}`;
    const context = createMockContext(url);

    const response = await onRequestGet(context);

    expect(response).not.toBeNull();
    expect(response.status).toBe(StatusCodes.OK);
    expect(response.headers.get("content-type")).toBe("image/svg+xml");
    expect(response.headers.get("cache-control")).toBe("public, max-age=3600");

    const svgText = await response.text();

    // Expected SVG for seed=987, size 1x1 (based on actual output)
    const expectedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" height="1" width="1"><g stroke-linecap="round" stroke-width="${defaults.lineThickness.toString()}"><line stroke="#EC4899" y2="1" x2="1" y1="0" x1="0" /><line stroke="#EC4899" y2="1" x2="2" y1="0" x1="1" /><line stroke="#EC4899" y2="2" x2="1" y1="1" x1="0" /><line stroke="#EC4899" y2="2" x2="2" y1="1" x1="1" /></g></svg>`;

    expect(svgText).toBe(expectedSvg);
  });

  it("should return 400 Bad Request if parameter validation fails", async () => {
    // Use an invalid width parameter
    const url = `${BASE_URL}?width=abc`;
    const context = createMockContext(url);

    const response = await onRequestGet(context);

    expect(response).not.toBeNull();
    expect(response.status).toBe(StatusCodes.BAD_REQUEST);
    expect(response.headers.get("content-type")).toBe("application/json");
    const body: unknown = await response.json();
    expect(body).toHaveProperty("message", "Invalid query parameters");
    expect(body).toHaveProperty("errors");
  });

  it("should return 302 Redirect if URL normalization returns a response", async () => {
    const url = `${BASE_URL}?width=100&height=100`;
    const context = createMockContext(url);

    const response = await onRequestGet(context);

    expect(response).not.toBeNull();
    expect(response.status).toBe(MOVED_TEMPORARILY);
    const location = response.headers.get("Location");
    expect(location).toBeDefined();
    expect(location).toContain(`${BASE_URL}?`);
    expect(location).toContain("width=100");
    expect(location).toContain("height=100");
    expect(location).toContain("seed="); // Check seed param exists
    expect(response.headers.get("Cache-Control")).toBe("public, max-age=60"); // Check cache
  });

  it("should return 500 Internal Server Error if SVG generation fails", async () => {
    const query = generateCanonicalQuery({ seed: 456 }); // Valid canonical URL
    const url = `${BASE_URL}?${query}`;
    const context = createMockContext(url);

    const validationError = new Error("Validation failed!");
    vi.spyOn(tenprint, "generateTenPrintGroupContent").mockImplementation(
      () => {
        throw validationError;
      },
    );

    const response = await onRequestGet(context);

    expect(response).not.toBeNull();
    expect(response.status).toBe(INTERNAL_SERVER_ERROR);
    const body = await response.text();
    expect(body).toBe("Error generating SVG");
  });
});
