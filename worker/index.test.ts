import { StatusCodes } from "http-status-codes";
import { describe, expect, it, vi } from "vitest";

import { configSchema } from "@/lib/config";
import { valueToString } from "@/lib/svg-api/helpers";

import worker from "./index";

const {
  BAD_REQUEST,
  METHOD_NOT_ALLOWED,
  MOVED_TEMPORARILY,
  NO_CONTENT,
  NOT_FOUND,
  OK,
} = StatusCodes;

const BASE_URL = "http://localhost:8788/svg";

function generateCanonicalQuery(overrides = {}): string {
  const defaults = configSchema.parse({});
  const params = { ...defaults, width: 100, height: 100, ...overrides };

  const sorted = Object.entries(params)
    .map(([key, value]) => [key, valueToString(value)])
    .sort(([a], [b]) => (a as string).localeCompare(b as string));

  return new URLSearchParams(sorted).toString();
}

function createMockEnv() {
  return {
    ASSETS: {
      fetch: vi.fn(),
    },
  };
}

describe("worker", () => {
  it("returns SVG content for a canonical /svg request", async () => {
    const query = generateCanonicalQuery({ seed: 123, width: 1, height: 1 });
    const request = new Request(`${BASE_URL}?${query}`);
    const env = createMockEnv();

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(OK);
    expect(response.headers.get("content-type")).toBe("image/svg+xml");
    expect(response.headers.get("cache-control")).toBe("public, max-age=3600");
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    const defaults = configSchema.parse({});
    const svgText = await response.text();
    const expectedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" height="1" width="1"><g stroke-linecap="round" stroke-width="${defaults.lineThickness.toString()}"><line stroke="#3B82F6" y2="0" x2="2" y1="1" x1="1" /><line stroke="#3B82F6" y2="1" x2="2" y1="2" x1="1" /><line stroke="#EC4899" y2="1" x2="1" y1="0" x1="0" /><line stroke="#EC4899" y2="2" x2="1" y1="1" x1="0" /></g></svg>`;
    expect(svgText).toBe(expectedSvg);
  });

  it("returns a redirect for non-canonical /svg query parameters", async () => {
    const request = new Request(`${BASE_URL}?width=100&height=100`);
    const env = createMockEnv();

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(MOVED_TEMPORARILY);
    expect(response.headers.get("location")).toContain(`${BASE_URL}?`);
    expect(response.headers.get("location")).toContain("width=100");
    expect(response.headers.get("location")).toContain("height=100");
    expect(response.headers.get("location")).toContain("seed=");
    expect(response.headers.get("cache-control")).toBe("public, max-age=60");
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("returns 400 for invalid /svg query parameters", async () => {
    const request = new Request(`${BASE_URL}?width=abc`);
    const env = createMockEnv();

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(BAD_REQUEST);
    expect(response.headers.get("content-type")).toBe("application/json");
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
    const body: unknown = await response.json();
    expect(body).toHaveProperty("message", "Invalid query parameters");
    expect(body).toHaveProperty("errors");
  });

  it("returns 204 for OPTIONS /svg", async () => {
    const request = new Request(BASE_URL, { method: "OPTIONS" });
    const env = createMockEnv();

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(NO_CONTENT);
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("returns 405 for unsupported /svg methods", async () => {
    const request = new Request(BASE_URL, { method: "POST" });
    const env = createMockEnv();

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(METHOD_NOT_ALLOWED);
    expect(response.headers.get("allow")).toBe("GET, HEAD, OPTIONS");
    expect(response.headers.get("access-control-allow-origin")).toBe("*");
  });

  it("returns 404 for non-/svg paths", async () => {
    const request = new Request("http://localhost:8788/");
    const env = createMockEnv();

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(NOT_FOUND);
  });
});
