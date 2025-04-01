import { StatusCodes } from "http-status-codes";
import { URL } from "url";
import { z } from "zod";

import { configSchemaBase } from "@/lib/config";

/**
 * Extend the base schema (which has defaults) to add width/height parameters
 * and makes the seed optional by providing a default value.
 */
export const svgQuerySchema = configSchemaBase.extend({
  width: z.coerce.number().int().positive(),
  height: z.coerce.number().int().positive(),
});

export type SvgQueryParams = z.infer<typeof svgQuerySchema>;

/**
 * Parse and validate the query parameters from the URL.
 *
 * @param url The URL to parse and validate
 * @returns The validated query parameters, with defaults applied for missing
 *          parameters
 */
export async function parseAndValidateQueryParameters(
  url: URL,
): Promise<SvgQueryParams> {
  const params = Object.fromEntries(url.searchParams.entries());
  // parseAsync applies defaults defined in the schema
  return await svgQuerySchema.parseAsync(params);
}

/**
 * Normalise the URL by adding all final parameters and sorting them.
 *
 * This function takes a URL and its validated parameters, creates a canonical
 * version by sorting the parameters, and redirects if the original URL is not
 * canonical. Unknown query parameters will be removed.
 *
 * Normalisation ensures SVGs can be cached properly. Since caching is keyed by
 * the URL including query string, if we were able to return the same SVG for
 * differently-ordered URLs, we could end up computing and storing the same SVG
 * multiple times.
 *
 * The redirect will be:
 * - 301 (Permanent) if all keys were present but just needed reordering
 * - 302 (Temporary) if keys were missing and defaults were applied
 *
 * @param originalUrl The original URL to normalize
 * @param finalParams The validated query parameters
 * @returns A Response object for redirection, or null if no redirect needed
 */
export function normaliseUrlAndRedirect(
  originalUrl: URL,
  finalParams: SvgQueryParams,
): Response | null {
  const canonicalParams = new URLSearchParams();

  // Convert all values to string and sort the parameters
  Object.entries(finalParams)
    .map(([key, value]) => [key, value.toString()])
    .sort(([a], [b]) => (a as string).localeCompare(b as string))
    .forEach(([key, value]) => {
      canonicalParams.set(key as string, value as string);
    });

  const canonicalUrl = new URL(originalUrl.pathname, originalUrl.origin);
  canonicalUrl.search = canonicalParams.toString();

  const originalUrlString = originalUrl.toString();
  const canonicalUrlString = canonicalUrl.toString();

  // If URLs match, no redirect needed
  if (originalUrlString === canonicalUrlString) {
    return null;
  }

  // Determine redirect type:
  // 301 (Permanent) if all keys were present, just needed reordering/formatting.
  // 302 (Temporary) if keys were missing (defaults applied).
  const originalKeys = new Set(originalUrl.searchParams.keys());
  const canonicalKeys = new Set(Object.keys(finalParams));
  const allKeysPresent = originalKeys.isSupersetOf(canonicalKeys);

  const { MOVED_PERMANENTLY, MOVED_TEMPORARILY } = StatusCodes;

  const redirectStatus = allKeysPresent ? MOVED_PERMANENTLY : MOVED_TEMPORARILY;

  const cacheMaxAge = allKeysPresent ? 3600 : 60;

  console.log(
    `Redirecting: ${redirectStatus.toString()} from ${originalUrlString} to ${canonicalUrlString}`,
  );

  return new Response(null, {
    status: redirectStatus,
    headers: {
      Location: canonicalUrlString,
      "Cache-Control": `public, max-age=${cacheMaxAge.toString()}`,
    },
  });
}

/**
 * The outcome of processing an SVG request URL, which can either be a redirect
 * `Response` object, or the successfully parsed and validated query parameters.
 */
export type NormalisedRequest =
  | { type: "redirect"; response: Response }
  | { type: "success"; params: SvgQueryParams };

/**
 * Parses, validates, and normalizes 10PRINT SVG request parameters from a URL.
 *
 * Takes the incoming URL, checks all required parameters are present and valid,
 * applies defaults for any missing ones, reorders the parameters and checks if a
 * redirect is needed, if any of those operations caused the URL to change.
 *
 * @param requestUrl The incoming request URL.
 * @returns An object indicating whether a redirect is needed or providing the
 *          validated parameters.
 * @throws {ZodError} If the query parameters fail validation.
 */
export async function processSvgRequest(
  requestUrl: URL,
): Promise<NormalisedRequest> {
  const finalParams = await parseAndValidateQueryParameters(requestUrl);

  const redirectResponse = normaliseUrlAndRedirect(requestUrl, finalParams);

  if (redirectResponse) {
    return { type: "redirect", response: redirectResponse };
  }

  return { type: "success", params: finalParams };
}
