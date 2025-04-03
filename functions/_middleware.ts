import type { EventContext } from "@cloudflare/workers-types";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Expose-Headers": "location",
  "Access-Control-Max-Age": "86400",
};

/**
 * Middleware for the API. Adds CORS headers to all responses.
 *
 * @param context The event context
 *
 * @returns A response with CORS headers added.
 */
export async function onRequest<Env, P extends string, Data>(
  context: EventContext<Env, P, Data>,
) {
  const response = await context.next();

  Object.entries(corsHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}
