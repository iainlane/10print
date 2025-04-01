import type { EventContext } from "@cloudflare/workers-types";
import { StatusCodes } from "http-status-codes";
import { parseHTML } from "linkedom";
import { ZodError } from "zod";

import { type ProcessedSvgRequest, processSvgRequest } from "@/lib/svg-api";
import { generateTenPrintGroupContent } from "@/lib/tenprint";

const SVG_NS = "http://www.w3.org/2000/svg";

const { BAD_REQUEST, INTERNAL_SERVER_ERROR } = StatusCodes;

// Zod errors return error BAD_REQUEST (400) as these typically indicate
// incorrect user input. Other errors return INTERNAL_SERVER_ERROR (500)
// as these are unexpected errors.

class ZodErrorResponse extends Response {
  constructor(message: string, errors: ZodError) {
    super(JSON.stringify({ message, errors: errors.flatten() }, null, 2), {
      status: BAD_REQUEST,
      headers: { "content-type": "application/json" },
    });
  }
}

class InternalServerError extends Response {
  constructor(message: string) {
    super(message, {
      status: INTERNAL_SERVER_ERROR,
      headers: { "content-type": "text/plain" },
    });
  }
}

export async function onRequestGet<Env, P extends string, Data>(
  context: EventContext<Env, P, Data>,
) {
  const url = new URL(context.request.url);

  let processedRequest: ProcessedSvgRequest;
  try {
    processedRequest = await processSvgRequest(url);
  } catch (error) {
    if (error instanceof ZodError) {
      return new ZodErrorResponse("Invalid query parameters", error);
    }

    console.error("Unexpected error during parameter processing:", error);
    return new InternalServerError(
      "Internal Server Error during parameter processing",
    );
  }

  // Do we need to redirect to the canonical URL?
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
