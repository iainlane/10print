import { type Color, formatCss, formatHex, formatHex8 } from "culori";
import { StatusCodes } from "http-status-codes";
import { z } from "zod";

import { configSchemaBase } from "@/lib/config";

/**
 * Schema for width and height parameters.
 *
 * @see {@link configSchemaBase}
 */
export const widthHeightSchema = z.object({
  width: z.coerce.number().positive(),
  height: z.coerce.number().positive(),
});

export type WidthHeight = z.infer<typeof widthHeightSchema>;

export type SvgQueryParams = z.infer<typeof svgQuerySchema>;

/**
 * Extend the base schema (which has defaults) to add width/height parameters.
 */
export const svgQuerySchema = configSchemaBase.extend(widthHeightSchema.shape);

/**
 * Configuration for the TENPRINT function, with every field optional. Use this
 * when handling a typed object in an API and all missing fields should be
 * filled with defaults.
 */
export type PartialConfig = Partial<z.infer<typeof svgQuerySchema>>;

/**
 * Parse and validate the query parameters from the URL.
 *
 * @param url The URL to parse and validate
 * @returns The validated query parameters, with defaults applied for missing
 *          parameters
 */
export async function parseAndValidateQueryParameters(
  searchParams: URLSearchParams,
): Promise<SvgQueryParams> {
  const params = Object.fromEntries(searchParams.entries());

  // parseAsync applies defaults defined in the schema
  return await svgQuerySchema.parseAsync(params);
}

/**
 * Convert a parameter value to its URL string representation for URL encoding
 *
 * @param value The value to convert
 * @returns The string representation of the value
 */
export function valueToString(value: string | number | Color): string {
  if (typeof value === "number") {
    return value.toString();
  }

  if (typeof value === "string") {
    return value;
  }

  if (value.mode === "rgb") {
    if (value.alpha === undefined || value.alpha >= 1) {
      return formatHex(value).toUpperCase();
    }

    return formatHex8(value).toUpperCase();
  }

  return formatCss(value);
}

/**
 * Convert the SVG paramaters to URL search parameters. Each parameter is
 * converted to a string and then sorted by key.
 *
 * @see {@link normaliseUrlAndRedirect} for an explanation of the URL
 *      canonicalisation process.
 *
 * @param params The SVG parameters to convert
 * @returns The URLSearchParams object
 */
export function toUrlSearchParams(params: PartialConfig): URLSearchParams {
  const canonicalParams = new URLSearchParams();

  Object.entries(params)
    .map(([key, value]) => [key, valueToString(value)])
    .sort(([a], [b]) => (a as string).localeCompare(b as string))
    .forEach(([key, value]) => {
      canonicalParams.set(key as string, value as string);
    });

  return canonicalParams;
}

/**
 * Normalise the URL by adding all parameters and sorting them.
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
  const canonicalParams = toUrlSearchParams(finalParams);

  const canonicalUrl = new URL(originalUrl.pathname, originalUrl.origin);
  canonicalUrl.search = canonicalParams.toString();

  const originalUrlString = originalUrl.toString();
  const canonicalUrlString = canonicalUrl.toString();

  // If URLs match, no redirect needed
  if (originalUrlString === canonicalUrlString) {
    return null;
  }

  // URLs differ, so we need to redirect

  // Determine redirect type:
  // 301 (Permanent) if all keys were present, just needed reordering/formatting.
  // 302 (Temporary) if keys were missing (defaults applied).
  const originalKeys = new Set(originalUrl.searchParams.keys());
  const canonicalKeys = new Set(Object.keys(finalParams));
  const allKeysPresent = originalKeys.isSupersetOf(canonicalKeys);

  const { MOVED_PERMANENTLY, MOVED_TEMPORARILY } = StatusCodes;

  const redirectStatus = allKeysPresent ? MOVED_PERMANENTLY : MOVED_TEMPORARILY;

  const cacheMaxAge = allKeysPresent ? 3600 : 60;

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
export async function processSvgRequestUrl(
  url: URL,
): Promise<NormalisedRequest> {
  const finalParams = await parseAndValidateQueryParameters(url.searchParams);

  const redirectResponse = normaliseUrlAndRedirect(url, finalParams);

  if (redirectResponse) {
    return { type: "redirect", response: redirectResponse };
  }

  return { type: "success", params: finalParams };
}
