import { type Context } from "hono";
import { StatusCodes } from "http-status-codes";
import { parseHTML } from "linkedom";
import * as z from "zod/mini";

import { type ProcessedSvgRequest, processSvgRequestUrl } from "@/lib/svg-api";
import { generateTenPrintGroupContent } from "@/lib/tenprint";

const SVG_NS = "http://www.w3.org/2000/svg";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR, NO_CONTENT } = StatusCodes;

type WorkerContext = Context<{ Bindings: Env }>;

/**
 * Response class for user errors, such as invalid input. Returns the raw error
 * in the body, as JSON, and a 400 Bad Request error response code.
 */
class ZodErrorResponse extends Response {
  constructor(message: string, errors: z.core.$ZodError) {
    super(
      JSON.stringify({ message, errors: z.prettifyError(errors) }, null, 2),
      {
        status: BAD_REQUEST,
        headers: { "content-type": "application/json" },
      },
    );
  }
}

/**
 * Response class for unexpected errors which are the server's fault/responsibility.
 * Returns the supplied message in the body, as plain text, and a 500 Internal
 * Server Error response code.
 */
class InternalServerError extends Response {
  constructor(message: string) {
    super(message, {
      status: INTERNAL_SERVER_ERROR,
      headers: { "content-type": "text/plain" },
    });
  }
}

/**
 * Handle a `HEAD` request. The request URL is processed. If the URL is a
 * redirect, the redirect response is returned. Otherwise, a response with no
 * body is returned.
 */
export async function onSvgHead(c: WorkerContext): Promise<Response> {
  const url = new URL(c.req.raw.url);
  const processedRequest = await processSvgRequestUrl(url);

  if (processedRequest.type === "redirect") {
    return processedRequest.response;
  }

  return new Response(null);
}

/**
 * Handle a `GET` request. The request URL is processed. If the URL is a
 * redirect, the redirect response is returned. Otherwise, the SVG content is
 * generated and returned.
 */
export async function onSvgGet(c: WorkerContext): Promise<Response> {
  const url = new URL(c.req.raw.url);

  let processedRequest: ProcessedSvgRequest;
  try {
    processedRequest = await processSvgRequestUrl(url);
  } catch (error) {
    if (error instanceof z.core.$ZodError) {
      return new ZodErrorResponse("Invalid query parameters", error);
    }

    console.error("Unexpected error during parameter processing:", error);
    return new InternalServerError(
      "Internal Server Error during parameter processing",
    );
  }

  if (processedRequest.type === "redirect") {
    return processedRequest.response;
  }

  const queryParams = processedRequest.params;
  const { width, height, ...configValues } = queryParams;

  try {
    const { document } = parseHTML("<html><body></body></html>");

    const groupContent = generateTenPrintGroupContent(
      document,
      configValues,
      width,
      height,
    );

    const svgElement = document.createElementNS(SVG_NS, "svg");
    svgElement.setAttribute("width", width.toString());
    svgElement.setAttribute("height", height.toString());
    svgElement.setAttribute(
      "viewBox",
      `0 0 ${width.toString()} ${height.toString()}`,
    );
    svgElement.setAttribute("xmlns", SVG_NS);
    svgElement.appendChild(groupContent);
    const svgString = svgElement.outerHTML;

    return new Response(svgString, {
      headers: {
        "content-type": "image/svg+xml",
        "cache-control": "public, max-age=3600",
      },
    });
  } catch (error) {
    console.error("Error generating SVG:", error);
    return new InternalServerError("Error generating SVG");
  }
}

/**
 * Handle preflight checks for `/svg`.
 */
export function onSvgOptions(): Response {
  return new Response(null, { status: NO_CONTENT });
}
