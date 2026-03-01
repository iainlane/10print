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

function headersToObject(response: Response): Record<string, string> {
  return Object.fromEntries(response.headers.entries());
}

describe("worker", () => {
  it("returns SVG content for a canonical /svg request", async () => {
    const query = generateCanonicalQuery({ seed: 123, width: 1, height: 1 });
    const request = new Request(`${BASE_URL}?${query}`);
    const env = createMockEnv();

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(OK);
    expect(headersToObject(response)).toMatchObject({
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=3600",
      "access-control-allow-origin": "*",
    });
    const defaults = configSchema.parse({});
    const svgText = await response.text();
    const expectedSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" height="1" width="1"><g stroke-linecap="round" stroke-width="${defaults.lineThickness.toString()}"><line stroke="#3B82F6" y2="0" x2="2" y1="1" x1="1" /><line stroke="#3B82F6" y2="1" x2="2" y1="2" x1="1" /><line stroke="#EC4899" y2="1" x2="1" y1="0" x1="0" /><line stroke="#EC4899" y2="2" x2="1" y1="1" x1="0" /></g></svg>`;
    expect(svgText).toBe(expectedSvg);
  });

  it("returns headers for a canonical HEAD /svg request", async () => {
    const query = generateCanonicalQuery({ seed: 123, width: 1, height: 1 });
    const request = new Request(`${BASE_URL}?${query}`, { method: "HEAD" });
    const env = createMockEnv();

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(OK);
    expect(headersToObject(response)).toMatchObject({
      "content-type": "image/svg+xml",
      "cache-control": "public, max-age=3600",
      "access-control-allow-origin": "*",
    });
    expect(await response.text()).toBe("");
  });

  it("returns 400 for invalid HEAD /svg query parameters", async () => {
    const request = new Request(`${BASE_URL}?width=abc`, { method: "HEAD" });
    const env = createMockEnv();

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(BAD_REQUEST);
    expect(headersToObject(response)).toMatchObject({
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    });
  });

  it("returns a redirect for non-canonical /svg query parameters", async () => {
    const request = new Request(`${BASE_URL}?width=100&height=100`);
    const env = createMockEnv();

    const response = await worker.fetch(request, env);
    const headers = headersToObject(response);
    const location = response.headers.get("location");

    expect(response.status).toBe(MOVED_TEMPORARILY);
    expect(headers).toMatchObject({
      "cache-control": "public, max-age=60",
      "access-control-allow-origin": "*",
    });
    expect(location).not.toBeNull();
    const redirectUrl = new URL(location as string);
    expect({
      origin: redirectUrl.origin,
      pathname: redirectUrl.pathname,
      width: redirectUrl.searchParams.get("width"),
      height: redirectUrl.searchParams.get("height"),
      hasSeed: redirectUrl.searchParams.has("seed"),
    }).toEqual({
      origin: "http://localhost:8788",
      pathname: "/svg",
      width: "100",
      height: "100",
      hasSeed: true,
    });
  });

  it("returns 400 for invalid /svg query parameters", async () => {
    const request = new Request(`${BASE_URL}?width=abc`);
    const env = createMockEnv();

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(BAD_REQUEST);
    expect(headersToObject(response)).toMatchObject({
      "content-type": "application/json",
      "access-control-allow-origin": "*",
    });
    const body: unknown = await response.json();
    expect(body).toHaveProperty("message", "Invalid query parameters");
    expect(body).toHaveProperty("errors");
  });

  it("returns 204 for OPTIONS /svg", async () => {
    const request = new Request(BASE_URL, { method: "OPTIONS" });
    const env = createMockEnv();

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(NO_CONTENT);
    expect(headersToObject(response)).toMatchObject({
      "access-control-allow-origin": "*",
    });
  });

  it("returns 405 for unsupported /svg methods", async () => {
    const request = new Request(BASE_URL, { method: "POST" });
    const env = createMockEnv();

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(METHOD_NOT_ALLOWED);
    expect(headersToObject(response)).toMatchObject({
      allow: "GET, HEAD, OPTIONS",
      "access-control-allow-origin": "*",
    });
  });

  it("returns 404 for non-/svg paths", async () => {
    const request = new Request("http://localhost:8788/");
    const env = createMockEnv();

    const response = await worker.fetch(request, env);

    expect(response.status).toBe(NOT_FOUND);
  });
});
